import { ElMessage, ElMessageBox } from 'element-plus'
import { Listener } from './listener'
import { compressAccurately } from 'image-conversion'
import request from '@/request'

export const getTimer = (stringTime: string) => {
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let week = day * 7
  let month = day * 30
  let time1 = new Date().getTime() //当前的时间戳
  // console.log(time1)
  let time2 = Date.parse(stringTime) //指定时间的时间戳
  // console.log(time2)
  let time = time1 - time2
  let result = null
  if (time < 0) {
    alert('设置的时间不能早于当前时间！')
  } else if (time / month >= 1) {
    result = Math.floor(time / month) + '月前'
  } else if (time / week >= 1) {
    result = Math.floor(time / week) + '周前'
  } else if (time / day >= 1) {
    result = Math.floor(time / day) + '天前'
  } else if (time / hour >= 1) {
    result = Math.floor(time / hour) + '小时前'
  } else if (time / minute >= 1) {
    result = Math.floor(time / minute) + '分钟前'
  } else {
    result = '刚刚'
  }
  return result
}
// 防抖函数
export const debounce = (fn: Function, delay = 1600) => {
  // 定时器
  let timer: number | null | any = null
  // 将debounce处理结果当作函数返回
  return (...args: any[]) => {
    // 每次事件被触发时，都去清除之前的旧定时器
    if (timer) {
      clearTimeout(timer)
    }
    // 设立新定时器
    timer = setTimeout(function() {
      fn(...args)
    }, delay)
  }
}
export const cusConfirm = (title: string, fn: Function) => {
  ElMessageBox.confirm(title, '操作提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customStyle: { padding: '14px 0 20px' },
    showClose: false,
    center: true
  }).then(() => {
    fn()
  })
}
export const isToBottom = (fn: () => void) => {
  let position = window.pageYOffset || document.documentElement.scrollTop
  let docHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  )
  if (position + window.innerHeight >= docHeight - 1) {
    fn()
  }
}
export const listener = new Listener()
export const compressImg = (file: File) => {
  let maxsize = 300
  let typeList = ['image/jpeg', 'image/png', 'image/gif']
  let isValid = typeList.includes(file.type)
  let need_press = file.size / 1024 > maxsize
  if (!isValid) {
    ElMessage.error('图片格式只能是 JPG/PNG/GIF!')
  }
  return new Promise((resolve, reject) => {
    if (!isValid) {
      return reject()
    }
    if (!need_press) {
      return resolve(file)
    }
    compressAccurately(file, maxsize).then(res => {
      // if (res instanceof Blob) {
      //   res = new File([res], file.name, { type: file.type })
      // }
      resolve(res)
    })
  })
}
// 上传图片
export const uploadImg = async (files: any[]) => {
  if (files.length == 0) {
    return null
  }
  let imgList: any[] = []
  for (let i = 0; i < files.length; i++) {
    // let res: any = await compressImg(files[i])  // 压缩图片
    let form_data = new FormData()
    form_data.append('file', files[i], files[i].name)
    await request.post('/api/shortMsg/upload', form_data).then((uploadRes) => {
      imgList[i] = uploadRes.data.url
    }).catch((error) => {
      console.log(error)
    })
  }
  console.log(imgList)
  return { code: 200, data: imgList }
}
