<template>
    <div @click="changeCode()" class="code" :style="{width:width,height:height,margin:margin,backgroundColor:'#f1f1f1'}">
        <img width="100%" height="100%" :src="codeImg" alt="">
    </div>
</template>
<script setup>
import { ref } from 'vue'
import request from '@/util/request';
const codeImg = ref("")
const codeId = ref("")
const changeCode = () => {
    requestImg()
}
const requestImg = () => {
    request.interceptors.request.use(config => {
        config.headers['Captcha-Id'] = codeId.value
        return config
    })
    request.get('/getCodeImage?' + new Date().getTime()).then(res => {
        codeId.value = res.headers.get("Captcha-Id")
        codeImg.value = res.headers.get("Base64Img")
    }).catch(err => {
        console.log(err)
    })
}
requestImg()
defineExpose({
    changeCode,
    codeId
})
const props = defineProps({
    width:{
        type: String,
        default: '100px'
    },
    height:{
        type: String,
        default: '40px'
    },
    margin:{
        type: String,
        default: '0'
    }
})
</script>
<style scoped>
.code {
    cursor: pointer;
}
</style>
