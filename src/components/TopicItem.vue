<template>
  <tr class="item">
    <td style="width: 710px">
      <div class="info">
        &nbsp;[<span class="label">{{ props.item.label }}</span
        >]
        <span class="title" @click="onClickTitle(props.item.id)">{{ props.item.title }}</span>
      </div>
    </td>
    <td style="width: 100px">
      <div class="author">
        <span @click="onClickUser(props.item.user)">{{ props.item.name }}</span>
        <br />
        <span>{{ props.item.date }}</span>
      </div>
    </td>
    <td style="width: 80px">
      <div class="num">{{ props.item.view }}/{{ props.item.comment }}</div>
    </td>
    <td style="width: 40px">
      <div class="avatar">
        <img class="img" :src="'/src/assets/avatar/' + props.item.avatar" alt="" />
      </div>
    </td>
    <td v-show="isEdit" class="operate" style="width: 130px">
      &ensp;
      <McBtn :font-size="14" :padding="5" text="编 辑" type="oak" @click="onEdit(props.item.id)" />
      &ensp;
      <McBtn :font-size="14" :padding="5" text="删 除" type="oak" @click="onDel(props.item.id)" />
    </td>
  </tr>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import McBtn from './McBtn.vue'
import { deleteTopic } from '@/api/topic';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
const props = defineProps({
  item: Object,
  isEdit: {
    type: Boolean,
    default: false,
    require: false
  }
})

const router = useRouter()
const onClickTitle = (id) => {
  router.push('/topic/detail/' + id)
}
const onClickUser = () => {
  router.push('/personal/other/' + props.item.user)
}
const onEdit = (id) => {
  router.push('/topic/editTopic/' + id)
}

const onDel = async(id) => {
  ElMessageBox.confirm('确定删除此评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteTopic(id).then(res=>{
        router.go(0)
        ElNotification({
          title: '删除成功',
          message: '成功删除主题:'+props.item.title,
          type: 'success'
        })
        
      }).catch(err=>{
        let msg = err.response.data.ERROR
        if (msg == "ID is not a number"){
          ElMessage.error('删除失败，ID不是数字')
        }
        else if (msg == "DataSource error"){
          ElMessage.error('删除失败，数据源错误')
        }
        else if(msg == "You are not allowed to delete this topic"){
          ElMessage.error('删除失败，您无权删除此主题')
        }
        ElNotification({
          title: '删除失败',
          message: '删除主题:'+props.item.title+'失败',
          type: 'error'
        })
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
  
}
</script>
<style scoped>
.item {
  border: 1px solid #a58960;
  border-top: 0;
  text-align: center;
  line-height: 30px;
  background-color: #f3debf;
  width: 100%;
}

.info {
  text-align: left;
  line-height: 30px;
}
.label {
  color: #131313;
  cursor: pointer;
  font-size: 14;
}
.label:hover {
  color: #171964;
  text-decoration: underline;
}
.title {
  font-size: 18;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
}
.title:hover {
  text-decoration: underline;
}
.author {
  width: 100px;
  height: 30px;
}
.author span:nth-child(1) {
  position: relative;
  font-size: 15px;
  top: -8px;
  cursor: pointer;
}
.author span:nth-child(1):hover {
  text-decoration: underline;
}
.author span:nth-child(3) {
  position: relative;
  top: -24px;
  font-size: 12px;
  color: #666;
}
.num {
  width: 50px;
  font-size: 13px;
}
.avatar {
  width: 40px;
}
.img {
  position: relative;
  top: 5px;
  width: 30px;
  height: 30px;
}
.operate {
  display: flex;
  padding: 2.5px 5px;
}
</style>
