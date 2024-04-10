<template>
  <div class='legacyMapPage'>
    <el-card class='input-card'>
      <span>请选择城市：</span>
      <el-select v-model='selectValue' @change='selectCity' placeholder='请选择'>
        <el-option
          v-for='item in options'
          :key='item.value'
          :label='item.label'
          :value='item.value'>
        </el-option>
      </el-select>
    </el-card>
    <div id='container'>
      <!-- 地图弹窗 -->
      <div ref='infoWindowRef' class='infoWindow'>
        <el-descriptions title='非遗信息'>
          <el-descriptions-item label='名称'>{{ legacyDataItem?.Name_CN }}</el-descriptions-item>
          <el-descriptions-item label='年代'>{{ legacyDataItem?.Time }}</el-descriptions-item>
          <el-descriptions-item label='所在地'>{{ legacyDataItem?.Place_CN }}</el-descriptions-item>
          <el-descriptions-item label='类型'>
            <el-tag size='small'>{{ legacyDataItem?.CategoryCN }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label='联系地址'>{{ legacyDataItem?.Unit_CN }}</el-descriptions-item>
          <el-descriptions-item>
            <el-button type='text' @click='dialogVisible = true'>点击查看3D 模型 ></el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <el-dialog title='传统民间八角楼3D展示' v-model='dialogVisible' width='50%' :before-close='handleClose'>
      <div>
        <div class='sketchfab-embed-wrapper'>
          <iframe title='Chinese Temple Pagoda' frameborder='0' allowfullscreen mozallowfullscreen='true'
                  webkitallowfullscreen='true' allow='autoplay; fullscreen; xr-spatial-tracking' xr-spatial-tracking
                  execution-while-out-of-viewport execution-while-not-rendered web-share
                  src='https://sketchfab.com/models/e1a9cd5024f24b6aa4a7ee90a29d727b/embed'
                  style='width: 100%;height: 500px'
          ></iframe>
        </div>
      </div>
      <!--      <span slot='footer' class='dialog-footer'>-->
      <!--        <el-button @click='dialogVisible = false'>取 消</el-button>-->
      <!--        <el-button type='primary' @click='dialogVisible = false'>确 定</el-button>-->
      <!--      </span>-->
    </el-dialog>
  </div>
</template>
<script setup lang='ts'>
import AMapLoader from '@amap/amap-jsapi-loader'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import legacyData from './legacyData.json'
import request from '@/request'
// 坐标信息
const geocodes = ref<any>()
const AMAP_data = ref<any>()
const options = ref<any[]>([{
  value: '南京',
  label: '南京'
}, {
  value: '厦门',
  label: '厦门'
},
  {
    value: '四川',
    label: '四川'
  },
  {
    value: '湖南',
    label: '湖南'
  },
  {
    value: '郑州',
    label: '郑州'
  },
  {
    value: '重庆',
    label: '重庆'
  },
  {
    value: '温州',
    label: '温州'
  }
])
const infoWindowRef = ref(null)
const selectValue = ref<string>('')
const legacyDataItem = ref<any>({
  Proj_num: 'Ⅴ-60',
  Name_CN: '讲古',
  'Name_EN': 'JiangGu',
  CategoryCN: '曲艺',
  'CategoryEN': 'Quyi',
  Time: 2008,
  'Type_CN': '新增项目',
  'Type_EN': 'New project',
  Place_CN: '福建省厦门市思明区',
  'Place_EN': 'Siming District, Xiamen City, Fujian Province',
  Unit_CN: '厦门市思明区文化馆',
  'Unit_EN': 'Xiamen Siming District Cultural Center',
  'X': 118.077684,
  'Y': 24.448211,
  'ProvinceCN': '福建',
  'ProvinceEN': 'Fujian',
  'Region4CN': '东部',
  'Region4EN': 'Eastern China',
  'Region7CN': '华东',
  'Region7EN': 'East China'
})
let a = 12
let map: any = null
const dialogVisible = ref<boolean>(false)
const handleOpen = (done: any) => {
  console.log('打开了')
  dialogVisible.value = true
  console.log(dialogVisible.value)
}
const handleClose = (done: any) => {
  dialogVisible.value = false
}
// 选择不同的城市
const selectCity = () => {
  console.log(selectValue.value)
  moveToCity(selectValue.value)
}
const moveToCity = async (cityName: string) => {
  const params: Record<string, string> = {
    key: import.meta.env.VITE_AMAP_WEB_API_CODE,
    address: cityName
  }
  let res: any = await request.get<any>('/amap_api/v3/geocode/geo', { params })
  let position = res.geocodes[0].location
  console.log(res.geocodes[0].location)
  map.setZoomAndCenter(14, position.split(','))
}
onMounted(() => {
  AMapLoader.load({
    key: import.meta.env.VITE_APP_MAP_CODE, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0' // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  })
    .then((AMap) => {
      AMAP_data.value = AMap
      map = new AMap.Map('container', {
        // 设置地图容器id
        viewMode: '3D', // 是否为3D地图模式
        zoom: 11, // 初始化地图级别
        center: [116.397428, 39.90923], // 初始化地图中心点位置
        rotateEnable: true,
        pitchEnable: true,
        pitch: 50,
        rotation: -15,
        zooms: [2, 20]
      })
      // 添加插件
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.HawkEye', 'AMap.ControlBar', 'AMap.MapType', 'AMap.MouseTool'], function() {
        //异步同时加载多个插件
        // 添加地图插件
        map.addControl(new AMap.Scale()) // 显示当前地图中心的比例尺
        map.addControl(new AMap.HawkEye()) // 显示缩略图
        // map.addControl(new AMap.Geolocation()); // 定位当前位置
      })
      // 实现默认图层与卫星图,实时交通图层之间切换
      // map.addControl(new AMap.MapType(
      //   {
      //     position: {
      //       left: '100px',
      //       top: '10px'
      //     }
      //   }
      // ))
      const controlBar = new AMap.ControlBar({
        position: {
          right: '10px',
          top: '10px'
        }
      })
      map.addControl(controlBar)
      const toolBar = new AMap.ToolBar({
        position: {
          right: '40px',
          top: '110px'
        }
      })
      map.addControl(toolBar)
      // 信息窗口实体
      let infoWindow: {
        on: (arg0: string, arg1: any) => void;
        open: (arg0: any, arg1: any) => void;
        close: () => void;
      }
      //创建一个 Marker 实例：
      const marker = new AMap.Marker({
        position: new AMap.LngLat(116.39, 39.9), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: '北京'
      })
      legacyData.nanjing.forEach((cityItem: any) => {
        const cityLatitudeAndLongitude = cityItem.geometry.coordinates
        const legacyName = cityItem.properties.Name_CN
        const legacyMarker = new AMap.Marker({
          position: new AMap.LngLat(cityLatitudeAndLongitude[0], cityLatitudeAndLongitude[1]), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          title: legacyName
        })
        // marker 点击事件
        const markerClick = (e: any) => {
          console.log(e.target, 'e')
          console.log(legacyName)
          legacyDataItem.value = cityItem.properties
          infoWindow = new AMap.InfoWindow({
            isCustom: true, //使用自定义窗体
            //使用默认信息窗体框样式，显示信息内容
            // content: infoContent,
            content: infoWindowRef.value,
            anchor: 'bottom-center',
            offset: new AMap.Pixel(0, -30),
            // 点击地图关闭
            closeWhenClickMap: true,
            autoMove: true
          })
          infoWindow.open(map, e.target.getPosition())
        }
        legacyMarker.on('click', markerClick)
        //将创建的点标记添加到已有的地图实例：
        map.add(legacyMarker)
      })
      // marker 点击事件
      const markerClick = (e: any) => {
        console.log(e.target, 'e')
        //构建信息窗体中显示的内容
        let infoContent = `
        <div>
          <img style='float:left;' src=' https://webapi.amap.com/images/autonavi.png '/>
          <div>能剧</div>
          <div style='padding:0px 0px 0px 4px;'><b>高德软件</b>
        </div>
        `
        infoWindow = new AMap.InfoWindow({
          //使用默认信息窗体框样式，显示信息内容
          content: infoContent,
          anchor: 'bottom-center',
          offset: new AMap.Pixel(0, -40),
          // 点击地图关闭
          closeWhenClickMap: true,
          autoMove: true
        })
        infoWindow.open(map, e.target.getPosition())
      }
      marker.on('click', markerClick)
      //将创建的点标记添加到已有的地图实例：
      map.add(marker)

      //在指定位置打开信息窗体
      function openInfo() {
      }

      function closeInfo() {
        infoWindow.close()
      }
    })
    .catch((e) => {
      console.log(e)
    })
})
onUnmounted(() => {
  map?.destroy()
})
</script>
<style scoped>
.legacyMapPage {
    position: relative;
    width: 100%;
    height: 760px;
    padding: 0;
    margin: 0;
}

.input-card {
    position: absolute;
    z-index: 10;
    /*padding: 10px;*/
    top: 10px;
    left: 10px;
    bottom: auto;
}

.infoWindow {
    padding: 10px;
    background: white;
    border-radius: 10px;
}

#container {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 800px;
}
</style>
