var express = require('express')
var router = express.Router()
var PraisModel = require('../model/praises')
var MessModel = require('../model/messages')
var UsersModel = require('../model/users')

router.all('/', (req, res) => {
  res.send('赞和收藏API')
})

// 添加/取消点赞或收藏 已重构 未对接
router.post('/toggle', async (req, res, next) => {
  let created_by = req.auth._id
  let body = req.body
  try {
    let { target_user, target_id, target_type } = body
    if (!target_id || !target_type || !target_user) {
      return res.status(400).send({ message: '参数缺失' })
    }
    body.created_by = created_by
    let action = 'delete'
    let result = await PraisModel.findOneAndDelete(body)
    if (!result) {
      action = 'create'
      result = await PraisModel.create(body)
      await MessModel.create({
        source_id: result._id,
        type: 2,
        user_id: target_user,
      })
    }
    let add_val = action == 'create' ? 1 : -1
    let inc_vals = { jue_power: add_val }
    if (!body.type || body.type == 1) {
      inc_vals.good_num = add_val
    }
    await UsersModel.findByIdAndUpdate(target_user, {
      $inc: inc_vals,
    })
    res.send({
      action,
      message: action == 'create' ? '创建成功' : '取消成功',
    })
  } catch (err) {
    next(err)
  }
})

// 获取我的赞和收藏列表 已重构 未对接
router.get('/mylist', async (req, res, next) => {
  let user_id = req.auth._id
  let { per_page, page } = req.query
  try {
    per_page = +per_page || 10
    page = +page || 1
    let skip = (page - 1) * per_page
    let where = { target_user: ObjectId(user_id) }
    let total = await PraisModel.count(where)
    let lists = await PraisModel.aggregate([
      { $match: where },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'articles',
          localField: 'target_id',
          foreignField: '_id',
          as: 'article',
        },
      },
      {
        $lookup: {
          from: 'shortmsgs',
          localField: 'target_id',
          foreignField: '_id',
          as: 'shortmsg',
        },
      },
      {
        $addFields: {
          article: {
            $first: '$article',
          },
          shortmsg: {
            $first: '$shortmsg',
          },
          user: {
            $first: '$user',
          },
        },
      },
      { $skip: skip },
      {
        $limit: per_page,
      },
    ])
    await MessModel.updateMany(
      {
        status: 0,
        type: 2,
        user_id,
      },
      {
        status: 1,
      }
    )
    res.send({
      meta: {
        total,
        page,
        per_page,
      },
      data: lists,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
