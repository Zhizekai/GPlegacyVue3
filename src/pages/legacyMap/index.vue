<template>
<div>{{a}}

  <div id="container"></div>
  <div class="input-item">
    <button id="clickOn"  class="btn" style="margin-right:1rem;">打开信息窗体</button>
    <button id="clickOff" class="btn">关闭信息窗体</button>
  </div>
</div>
</template>

<script setup lang='ts'>
import AMapLoader from '@amap/amap-jsapi-loader';
import { onMounted, onUnmounted } from 'vue'
let a = 12
let map:any = null;


onMounted(() => {

  AMapLoader.load({
    key: import.meta.env.VITE_APP_MAP_CODE, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    })
    .then((AMap) => {
      map = new AMap.Map("container", {
        // 设置地图容器id
        viewMode: "3D", // 是否为3D地图模式
        zoom: 11, // 初始化地图级别
        center: [116.397428, 39.90923], // 初始化地图中心点位置

        rotateEnable:true,
        pitchEnable:true,
        pitch: 50,
        rotation: -15,
        zooms:[2,20],
      });

      // 添加插件
      AMap.plugin(["AMap.ToolBar", "AMap.Scale", "AMap.HawkEye", "AMap.Geolocation", "AMap.MapType", "AMap.MouseTool"], function () {
        //异步同时加载多个插件
        // 添加地图插件

        map.addControl(new AMap.Scale()); // 显示当前地图中心的比例尺
        map.addControl(new AMap.HawkEye()); // 显示缩略图
        // map.addControl(new AMap.Geolocation()); // 定位当前位置

        // 实现默认图层与卫星图,实时交通图层之间切换
        map.addControl(new AMap.MapType(
          {
            position:{
              left:'100px',
              top:'10px'
            }
          }
        ));
      });


      //信息窗体的内容
      const content = [
        "<div><b>高德软件有限公司</b>",
        "电话 : 010-84107000   邮编 : 100102",
        "地址 : 北京市望京阜通东大街方恒国际中心A座16层</div>",
      ];



      let infoWindow: { on: (arg0: string, arg1: any) => void; open: (arg0: any, arg1: any) => void; close: () => void; };
//在指定位置打开信息窗体
      function openInfo() {
        //构建信息窗体中显示的内容
        var info = [];
        info.push("<div><div><img style=\"float:left;\" src=\" https://webapi.amap.com/images/autonavi.png \"/></div> ");
        info.push("<div style=\"padding:0px 0px 0px 4px;\"><b>高德软件</b>");
        info.push("电话 : 010-84107000   邮编 : 100102");
        info.push("地址 :北京市朝阳区望京阜荣街10号首开广场4层</div></div>");
        infoWindow = new AMap.InfoWindow({
          content: info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
        });
        infoWindow.open(map, map.getCenter());

      }
      function closeInfo() {
        infoWindow.close();
      }


        //创建一个 Marker 实例：
      const marker = new AMap.Marker({
        position: new AMap.LngLat(116.39, 39.9), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: "北京",
      });
      marker.on('click',openInfo)
      //将创建的点标记添加到已有的地图实例：
      map.add(marker);


      const controlBar = new AMap.ControlBar({
        position:{
          right:'10px',
          top:'10px'
        }
      });
      map.addControl(controlBar)

      const toolBar = new AMap.ToolBar({
        position:{
          right:'40px',
          top:'110px'
        }
      });
      map.addControl(toolBar)





    })
    .catch((e) => {
      console.log(e);
    });
});





onUnmounted(() => {
  map?.destroy();
});
</script>

<style scoped>
#container{
    padding:0;
    margin: 0;
    width: 100%;
    height: 800px;
}
</style>
