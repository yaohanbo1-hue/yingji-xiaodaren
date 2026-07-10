/**
 * 应急小达人 v1.5.4 — 百科内容扩展包
 * 通过 EncyclopediaEngine 的第三个数据源（ENC_V153）追加高质量文章，
 * 不改动现有 EXTRA / FINAL 数据，纯增量合并。
 */
const ENC_V153 = {
  earthquake: [
    {
      title: "地震预警APP使用指南",
      icon: "📱",
      content: "手机地震预警怎么用：<br><br>" +
        "🔹 <strong>开启权限</strong>：允许APP后台运行、通知、定位<br>" +
        "🔹 <strong>设置关注地</strong>：添加常驻城市，接收该地预警<br>" +
        "🔹 <strong>试听警报</strong>：先听一遍警报声，紧急时才能立刻识别<br>" +
        "🔹 <strong>别关通知</strong>：很多人因静音错过黄金预警秒数<br><br>" +
        "⚠️ 预警≠预报：它是在<strong>地震波到达前几秒到几十秒</strong>的临震提醒，" +
        "收到后应立即避险，不要等‘正式通知’。"
    }
  ],
  fire: [
    {
      title: "公共场所火灾逃生",
      icon: "🏬",
      content: "商场、影院、地铁等公共场所失火：<br><br>" +
        "🔹 <strong>看清出口</strong>：进入时留意安全出口和疏散通道位置<br>" +
        "🔹 <strong>跟着疏散指示</strong>：绿底白字‘安全出口’标志指向逃生方向<br>" +
        "🔹 <strong>低姿捂鼻</strong>：烟雾向上聚集，弯腰或匍匐撤离<br>" +
        "🔹 <strong>不乘电梯</strong>：断电后会被困<br>" +
        "🔹 <strong>有序不慌</strong>：切勿拥挤踩踏，听从工作人员指挥<br><br>" +
        "⚠️ 哪怕火势很小，也应立即撤离并拨打119，不要观望。"
    }
  ],
  flood: [
    {
      title: "城市内涝自救要点",
      icon: "🌆",
      content: "暴雨导致城市内涝时：<br><br>" +
        "🔹 <strong>避开地下空间</strong>：不去地铁、地下车库、地下商场<br>" +
        "🔹 <strong>绕开积水桥洞</strong>：积水深度不明切勿强行通过<br>" +
        "🔹 <strong>远离漩涡</strong>：路面漩涡可能是缺失井盖的下水口<br>" +
        "🔹 <strong>触电危险</strong>：积水中有掉落电线可致触电，远离开关、电箱<br>" +
        "🔹 <strong>高处待援</strong>：被困时上二楼或屋顶，用鲜艳衣物求救<br><br>" +
        "⚠️ 车辆涉水熄火后<strong>立即弃车</strong>，水深齐腰切勿继续前行。"
    }
  ],
  typhoon: [
    {
      title: "台风预警信号解读",
      icon: "🚦",
      content: "台风预警分四级，颜色越深越严重：<br><br>" +
        "🔵 <strong>蓝色</strong>：24小时内可能受影响，需关注<br>" +
        "🟡 <strong>黄色</strong>：24小时内将受影响，减少外出<br>" +
        "🟠 <strong>橙色</strong>：12小时内将受影响，停课停业<br>" +
        "🔴 <strong>红色</strong>：6小时内将受强风影响，<strong>进入特别紧急防御状态</strong><br><br>" +
        "⚠️ 看到<strong>橙色及以上</strong>预警，就应把车辆移到高处、备好应急物资、尽量不要出门。"
    }
  ],
  tsunami: [
    {
      title: "海啸来袭自救要点",
      icon: "🌊",
      content: "海岸附近突发海啸如何自救：<br><br>" +
        "🔹 <strong>海水暴退立刻跑</strong>：海滩突然大面积裸露是最强前兆<br>" +
        "🔹 <strong>向高处撤离</strong>：跑到海拔30米以上或坚固高层建筑的3层以上<br>" +
        "🔹 <strong>往内陆跑</strong>：垂直海岸线向内陆方向，不要沿平行海岸跑<br>" +
        "🔹 <strong>不信‘只此一浪’</strong>：第一波后常有多波，间隔数十分钟<br>" +
        "🔹 <strong>听从广播</strong>：官方解除警报前不返回岸边<br><br>" +
        "⚠️ 地震后若身处海边，<strong>不要等预警</strong>，先向高处跑。"
    }
  ],
  gas: [
    {
      title: "燃气泄漏应急处置",
      icon: "🚨",
      content: "闻到燃气味（臭鸡蛋味）时：<br><br>" +
        "🔹 <strong>禁火禁电</strong>：不开关任何电器、不打火、不打电话<br>" +
        "🔹 <strong>关阀通风</strong>：轻开门窗，关闭燃气总阀<br>" +
        "🔹 <strong>室外报警</strong>：到室外安全处拨打燃气公司或119<br>" +
        "🔹 <strong>撤离邻居</strong>：提醒楼上楼下人员撤离<br><br>" +
        "⚠️ 绝对不要<strong>开排风扇或电灯</strong>试图换气，任何火花都可能引爆泄漏气体。"
    }
  ],
  extreme_heat: [
    {
      title: "户外作业防暑指南",
      icon: "👷",
      content: "建筑、环卫、快递等户外工作者防暑：<br><br>" +
        "🔹 <strong>避开高温时段</strong>：11—16时尽量减少露天作业<br>" +
        "🔹 <strong>少量多次喝水</strong>：不等口渴就补水分和盐分<br>" +
        "🔹 <strong>穿戴防晒</strong>：宽檐帽、浅色透气长袖、防晒霜<br>" +
        "🔹 <strong>结伴互看</strong>：互相留意是否头晕、乏力等中暑前兆<br>" +
        "🔹 <strong>阴凉休息</strong>：每1—2小时到阴凉处休息10分钟<br><br>" +
        "⚠️ 出现<strong>头晕、恶心、体温升高</strong>立即停下、降温、就医。"
    }
  ],
  nuclear: [
    {
      title: "核事故个人防护",
      icon: "☢️",
      content: "核事故或核警报发布后：<br><br>" +
        "🔹 <strong>听官方指令</strong>：是否撤离、服碘片以政府通知为准<br>" +
        "🔹 <strong>隐蔽 indoors</strong>：关窗关门、关空调新风、到无窗内室<br>" +
        "🔹 <strong>防尘护呼吸</strong>：用湿毛巾捂口鼻，戴防尘口罩<br>" +
        "🔹 <strong>撤离时向上风</strong>：远离烟羽方向，走指定路线<br>" +
        "🔹 <strong>清洗去污</strong>：外出归来淋浴、换洗衣物<br><br>" +
        "⚠️ 不要盲目服用碘片，<strong>过量反而有害</strong>，遵专业指导。"
    }
  ]
};

window.ENC_V153 = ENC_V153;
