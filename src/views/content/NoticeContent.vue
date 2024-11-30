<template>
    <div>
        <Book>
            <table class="noticeBlock">
                <tr class="chatTop">
                    <th class="listTitle"></th>
                    <th class="userTitle">
                        <div class="userTitleMain">
                            {{ noticeTitle }}
                        </div>
                    </th>
                </tr>
                <tr>
                    <td>
                        <div class="noticeList">
                            <div v-for="(item,index) in noticeUserList" :key="index" @click="listClick(item,index)">
                                <NoticeList :item="item" :active="index == listIndex" />
                            </div>
                        </div>
                    </td>
                    <td class="chatBox">
                        <div ref="noticeUser" class="noticeUser">
                            <div v-for="(item,index) in notices" :key="index">
                                <NoticeUserView :notices="item"/>
                            </div>
                        </div>
                        
                        <div class="sendBlock">
                            <textarea type="text" class="sendBox" v-model="contentValue"></textarea>
                            <div class="operate">
                                <div @click="send()">
                                    <McBtn text="发送"/>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        </Book>
    </div>
</template>
<script setup>
import Book from '@/components/Book.vue';
import NoticeList from '@/components/NoticeList.vue';
import NoticeUserView from '@/components/NoticeUserView.vue';
import McBtn from '@/components/McBtn.vue';
import { findMessageList, findMsgByToUserAndFromUser, sendMessage } from '@/api/message';
import { ElMessage,ElNotification } from 'element-plus';
import { inject, onMounted,ref } from 'vue';
import useUserStore from '@/stores/user';
const notices = ref([]);
const contentValue = ref('')
const noticeUserList = ref([]);
const noticeTitle = ref('')
const listIndex = ref(0)
const noticeUser = ref(null)
const userStore = useUserStore()
const init = async()=>{
    await getUserList()
    await getUserMsg(noticeUserList.value[listIndex.value].user)
    noticeTitle.value = noticeUserList.value[listIndex.value].name
}
const getUserList = async()=>{
    await findMessageList().then(res=>{
        console.log(res);
        noticeUserList.value = res.data.object
        
    }).catch(err=>{
        ElMessage.error('服务异常');
    });
}
const setViewBottom = ()=>{
    noticeUser.value.scrollTop = noticeUser.value.scrollHeight
}
const getUserMsg = async(fromUser)=>{
    notices.value = []
    await findMsgByToUserAndFromUser(fromUser).then(res=>{
        let data = res.data.object
        for (let i = 0; i < data.length; i++) {
            let contents = data[i].content.split('[&divide&]')
            notices.value.push({
                fromUser: data[i].fromUser,
                fromAvatar: data[i].fromAvatar,
                date: data[i].date,
                contents: contents
            })
        }
    }).catch(err=>{
        ElMessage.error('服务异常');
        console.log(err);
    })
    setViewBottom()
}
const listClick = (item,index)=>{
    listIndex.value = index
    noticeTitle.value = item.name
    getUserMsg(item.user)
}
const webSocket = inject('webSocket')
webSocket.value.onmessage = (e) => {
    let data = JSON.parse(e.data)
    ElNotification({
        title:'新消息-来自'+data.fromUser+'的消息',
        message:data.content,
        type:'success'
    })
    if(data.fromUser == noticeUserList.value[listIndex.value].user || data.fromUser == userStore.user){
        let obj = {
            fromUser: data.fromUser,
            fromAvatar: data.fromAvatar,
            date: data.date,
            contents: [data.content]
        }
        if(notices.value[notices.value.length-1].fromUser == obj.fromUser){
            if(timeDiff(notices.value[notices.value.length-1].date,obj.date) < 1){
                notices.value[notices.value.length-1].contents.push(data.content)
            }
            else{
                notices.value.push(obj)
            }
        }else{
            notices.value.push(obj)
        }
        setTimeout(() => {
            setViewBottom()
        }, 10);
    }
    else{
        let flag = true
        for (let i = 0; i < noticeUserList.value.length; i++) {
            if(noticeUserList.value[i].user == data.fromUser){
                flag = false
                break
            }
        }
        if(flag){
            let userList = {
                user: data.fromUser,
                name: data.fromName,
                avatar: data.fromAvatar,
                lastContent:data.content
            }
            let newlist = []
            newlist.push(userList)
            for (let i = 0; i < noticeUserList.value.length; i++) {
                newlist.push(noticeUserList.value[i])
            }
            noticeUserList.value = newlist
            listIndex.value ++;
        }

    }
    
}
const send = async()=>{
    if(contentValue.value.length == 0){
        ElMessage.error('消息内容不能为空');
        return;
    }
    else if(contentValue.value.length < 10){
        ElMessage.error('消息内容不能少于10个字符');
        return;
    }
    let indexTmp = listIndex.value
    await sendMessage(noticeUserList.value[indexTmp].user,contentValue.value).then(res=>{
        let data = res.data.object
        noticeUserList.value[indexTmp].lastContent = data.content
        let obj = {
            fromUser: userStore.user,
            fromAvatar: userStore.avatar,
            date: data.date,
            contents: [data.content]
        }
        if(notices.value[notices.value.length-1].fromUser == obj.fromUser){
            if(timeDiff(notices.value[notices.value.length-1].date,obj.date) < 1){
                notices.value[notices.value.length-1].contents.push(data.content)
            }
            else{
                notices.value.push(obj)
            }
        }else{
            notices.value.push(obj)
        }
        setTimeout(() => {
            setViewBottom()
        }, 10);
    }).catch(err=>{
        ElMessage.error('发送失败');
    })
}
const timeDiff = (newDate,oldDate)=>{
    let new_date = new Date(newDate)
    let old_date = new Date(oldDate)
    let diffInMilliseconds = new_date.getTime() - old_date.getTime()
    return Math.abs(diffInMilliseconds / (1000 * 60 * 2))
}
onMounted(init)
</script>
<style scoped>
.noticeBlock{
    width: 100%;
    border-collapse: collapse;
}
.noticeBlock th{
    text-align: left;
    font-size: 20px;
    font-weight: bold;
    background-color: #f3ddab;
}
.noticeBlock .chatTop{
    border-bottom: 1px solid #aaa;
}
.noticeBlock .chatBox{
    border-left: 1px solid #aaa;
}
.noticeBlock .listTitle{
    width: 25%;
    height: 50px;
    border-top-left-radius: 10px;
}

.noticeBlock .userTitle{
    border-top-right-radius: 10px;
}
.noticeBlock .userTitle .userTitleMain{
    height: 50px;
    padding-left: 30px;
    line-height: 60px;
}
.noticeList{
    height: 550px;
    width:100%;
    background-color: #f8eecf;
    border-bottom-left-radius: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    transition: all 250ms;
    border-right: 1px solid #111;
}
.noticeList::-webkit-scrollbar {
    width: 6px;
}
.noticeList::-webkit-scrollbar-thumb {
    background-color: #756c53;
    cursor:n-resize;
}
.noticeUser{
    height: 350px;
    background-color: #faf1d9;
    overflow-y: auto;
    overflow-x: hidden;
}
.noticeUser::-webkit-scrollbar {
    width: 6px;
    
}
.noticeUser::-webkit-scrollbar-thumb {
    background-color: #756c53;
    cursor:n-resize;
}
.sendBlock{
    width: 100%;
    height: 200px;
    background-color: #f1f1f1;
}
.sendBox{
    border:0;
    outline: none;
    width: 720px;
    height: 140px;
    font-size: 18px;
    padding: 10px;
    resize: none;
    background-color: #f1f1f1;
    border-top: 1px solid #aaa;
}
.operate{
    width: 100%;
    display: flex;
    justify-content: flex-end;
    height: 60px;
    background-color: #f5f5f5;
}
</style>