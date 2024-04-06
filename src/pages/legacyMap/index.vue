<template>
<div>{{a}}

  <div id="container"></div>
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
    plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {
      map = new AMap.Map("container", {
        // 设置地图容器id
        viewMode: "3D", // 是否为3D地图模式
        zoom: 11, // 初始化地图级别
        center: [116.397428, 39.90923], // 初始化地图中心点位置
      });

      AMap.plugin("AMap.ToolBar", function () {
        //在回调函数中实例化插件，并使用插件功能
        //在回调函数中实例化插件
        var toolbar = new AMap.ToolBar(); //创建工具条插件实例
        map.addControl(toolbar); //添加工具条插件到页面



      });
        //创建一个 Marker 实例：
      const marker = new AMap.Marker({
        position: new AMap.LngLat(116.39, 39.9), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        title: "北京",
      });
      //将创建的点标记添加到已有的地图实例：
      map.add(marker);


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
