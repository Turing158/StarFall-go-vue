<template>
    <div class="item" :class="props.active ? 'active' : 'none'">
        <div class="avatar">
            <img :src="'/src/assets/avatar/'+props.item.avatar" alt="">
        </div>
        <div class="info">
            <div class="username">{{ props.item.name }}</div>
            <div class="content">{{ props.item.lastContent }}</div>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
    item:Object,
    active:Boolean
})

</script>
<style scoped>

.item{
    height: 60px;
    background-color: #f8eecf;
    border-bottom: 1px solid #aaa;
    cursor: pointer;
    display: flex;
}
.item:hover:not(.active){
    background-color: #faf5e8;
}
.active{
    background-color: #eee1c1;
}
.item .avatar{
    width: 40px;
    height: 40px;
    background-color: #f1f1f1;
    margin: 10px 10px;
    border-radius: 10px;
}
.item .avatar img{
    margin: 2.5px;
    width: 35px;
    height: 35px;
    border-radius: 10px;

}
.item .info{
    height: 40px;
    margin: 10px 0;
}
.username{
    height: 28px;
    font-size: 17px;
    font-weight: bold;
}
.content{
    width: 110px;
    height: 30px;
    font-size: 14px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>