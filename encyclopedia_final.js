/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 防灾百科扩展模块
 * ===========================================================================
 * 
 * 【百科内容示例】
 * 
 * 地震基础知识:
 * - 地震是地球内部能量释放引起的地面震动
 * - 震级: 里氏震级 (M) 表示地震能量大小
 * - 烈度: 表示地震对地表的影响程度
 * - 震源深度: <70km 浅源, 70-300km 中源, >300km 深源
 * 
 * 逃生要点:
 * 1. 室内: 躲在坚固家具下，保护头部
 * 2. 室外: 远离建筑物、电线杆、广告牌
 * 3. 车内: 停车在空旷处，留在车内
 * 4. 地铁: 听从工作人员指挥，不要擅自扒门
 * 
 * 【模块说明】
 * EncyclopediaExtra 提供防灾百科的扩展内容，
 * 包括详细的灾害知识、应急指南、科普文章等。
 * 
 * 【内容分类】
 * 1. 自然灾害: 地震、洪水、台风、滑坡
 * 2. 气象灾害: 暴雪、干旱、雷电、沙尘暴
 * 3. 人为灾害: 火灾、燃气泄漏、化学品泄漏
 * 4. 应急知识: 急救技能、逃生路线、应急包准备
 * 
 * 【文章结构】
 * ARTICLES = [
 *   {
 *     id: "earthquake_basics",
 *     title: "地震基础知识",
 *     category: "自然灾害",
 *     icon: "🌍",
 *     content: "地震是地球内部能量释放...",
 *     tips: ["躲在桌子下", "不要使用电梯", "远离窗户"],
 *     quiz: [{ q: "...", opts: ["..."], ans: 0 }]
 *   }
 * ]
 * 
 * 【阅读奖励】
 * - 每阅读一篇文章: +5 金币
 * - 完成文章测验: +10 金币
 * - 每日首次阅读: +3 金币
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
const FINAL_ENCYCLOPEDIA={earthquake:[{title:"地震避难所建设标准",icon:"🏛️",content:"应急避难场所建设要求：<br><br><strong>选址要求：</strong><br>🔹 距离居民区<strong>步行15分钟以内</strong><br>🔹 远离高大建筑物和危险设施<br>🔹 地势较高，不在低洼地带<br>🔹 有<strong>充足水源</strong>和<strong>开阔空间</strong><br><br><strong>基本设施：</strong><br>🔹 <strong>供水系统</strong>（自来水+应急水井）<br>🔹 <strong>供电系统</strong>（电网+发电机）<br>🔹 <strong>排污系统</strong><br>🔹 <strong>通信设施</strong>（广播+电话）<br>🔹 <strong>医疗救护站</strong><br>🔹 <strong>物资储备仓库</strong><br><br>⚠️ 全国已建成<strong>数万个</strong>应急避难场所，你知道最近的在哪里吗？"},{title:"地震中的动物行为",icon:"🐕",content:"地震前动物可能出现的异常行为：<br><br><strong>陆地动物：</strong><br>🔹 狗<strong>不停吠叫</strong>、不愿进屋<br>🔹 猫<strong>叼着小猫搬家</strong><br>🔹 蛇<strong>冬天出洞</strong><br>🔹 老鼠<strong>成群逃窜</strong><br>🔹 牛羊<strong>不进圈</strong><br><br><strong>水生动物：</strong><br>🔹 鱼<strong>跃出水面</strong><br>🔹 青蛙<strong>大规模鸣叫</strong><br>🔹 水母<strong>异常聚集</strong><br><br><strong>鸟类：</strong><br>🔹 鸟类<strong>不回巢</strong><br>🔹 大规模<strong>迁徙方向异常</strong><br><br>⚠️ 动物异常不一定意味着地震，但多个物种同时出现异常值得警惕！"}],fire:[{title:"电动车防火安全",icon:"🔋",content:"电动自行车火灾危害极大：<br><br><strong>为什么危险：</strong><br>🔹 锂电池起火后<strong>难以扑灭</strong><br>🔹 燃烧产生<strong>大量有毒浓烟</strong><br>🔹 从起火到猛烈燃烧仅需<strong>30秒</strong><br>🔹 温度可达<strong>1000°C以上</strong><br><br><strong>安全使用：</strong><br>✅ 在<strong>室外指定区域</strong>充电<br>✅ 使用<strong>原装充电器</strong><br>✅ 不在<strong>楼道、室内</strong>充电<br>✅ 定期检查电池和线路<br>✅ 不使用<strong>改装电池</strong><br><br>❌ <strong>绝对不要</strong>把电动车推进电梯或室内！<br><br>⚠️ 电动车火灾已造成多起严重伤亡事故！"},{title:"高楼火灾逃生误区",icon:"🏢",content:"常见的高楼逃生错误做法：<br><br>❌ <strong>乘电梯逃生</strong> → 电梯可能断电、变形<br>❌ <strong>跳楼求生</strong> → 3楼以上跳楼死亡率极高<br>❌ <strong>直立奔跑</strong> → 浓烟区域弯腰前行<br>❌ <strong>用干毛巾</strong> → 湿毛巾过滤效果更好<br>❌ <strong>躲进浴室</strong> → 有些浴室门不防火<br>❌ <strong>返回取财物</strong> → 逃生后不要再返回<br><br>✅ 正确做法：<br>🔹 <strong>先摸门把手</strong>判断门外温度<br>🔹 <strong>弯腰低姿</strong>，用湿布捂鼻<br>🔹 <strong>沿楼梯</strong>向下撤离<br>🔹 楼道有烟时<strong>退回房间</strong>等待救援<br>🔹 在窗口<strong>挥舞鲜艳物品</strong>求救"}],gas:[{title:"燃气安全法律法规",icon:"⚖️",content:"燃气安全管理相关规定：<br><br><strong>用户责任：</strong><br>🔹 不得<strong>擅自改动</strong>燃气设施<br>🔹 不得<strong>包裹、暗埋</strong>燃气管道<br>🔹 发现隐患<strong>及时报告</strong><br>🔹 配合燃气公司<strong>入户安检</strong><br><br><strong>禁止行为：</strong><br>🔹 在燃气设施保护范围内<strong>施工</strong><br>🔹 <strong>偷盗</strong>燃气或破坏燃气设施<br>🔹 使用不合格的燃气器具<br><br><strong>处罚：</strong><br>🔹 违规操作可处<strong>1000-10000元</strong>罚款<br>🔹 造成事故需承担<strong>民事赔偿</strong>和<strong>刑事责任</strong><br><br>⚠️ 燃气安全人人有责！"}],tornado:[{title:"龙卷风与台风的区别",icon:"🌪️",content:"龙卷风和台风是不同的天气现象：<br><br><strong>台风：</strong><br>🔹 直径<strong>数百公里</strong><br>🔹 持续<strong>数天</strong><br>🔹 有<strong>明确的预警时间</strong>（可提前1-3天）<br>🔹 影响范围<strong>大</strong><br>🔹 破坏力<strong>相对均匀</strong><br><br><strong>龙卷风：</strong><br>🔹 直径<strong>几十到几百米</strong><br>🔹 持续<strong>几分钟到几十分钟</strong><br>🔹 几乎<strong>无法提前预警</strong>（只能几分钟前）<br>🔹 影响范围<strong>窄但集中</strong><br>🔹 中心破坏力<strong>极其惊人</strong><br><br>⚠️ 中国每年发生龙卷风约<strong>100次</strong>，主要集中在<strong>江苏、广东、安徽</strong>等省。"}],landslide:[{title:"滑坡防治工程措施",icon:"🏗️",content:"滑坡防治的工程方法：<br><br><strong>排水工程：</strong><br>🔹 <strong>截水沟</strong>：拦截地表水<br>🔹 <strong>排水沟</strong>：排出坡体内部水<br>🔹 <strong>排水隧洞</strong>：排出深层地下水<br><br><strong>支挡工程：</strong><br>🔹 <strong>挡土墙</strong>：阻止坡体前缘滑动<br>🔹 <strong>抗滑桩</strong>：深入稳定层固定坡体<br>🔹 <strong>锚索</strong>：将坡体锚固在稳定岩层<br><br><strong>削坡减载：</strong><br>🔹 削减坡顶重量<br>🔹 坡面绿化固土<br><br>⚠️ 滑坡治理是一项系统工程，需要<strong>专业评估和设计</strong>！"}],tsunami:[{title:"历史上的大海啸",icon:"📜",content:"著名海啸事件：<br><br><strong>2004年印度洋海啸：</strong><br>🔹 震级<strong>9.1级</strong><br>🔹 死亡<strong>23万人</strong><br>🔹 影响<strong>14个国家</strong><br>🔹 海浪最高达<strong>30米</strong><br><br><strong>2011年日本海啸：</strong><br>🔹 震级<strong>9.0级</strong><br>🔹 引发<strong>福岛核事故</strong><br>🔹 海浪高达<strong>40米</strong><br>🔹 死亡失踪<strong>约2万人</strong><br><br><strong>教训：</strong><br>🔹 海啸预警系统<strong>至关重要</strong><br>🔹 公众<strong>防灾意识</strong>决定生死<br>🔹 建筑<strong>抗震标准</strong>影响存活率<br>🔹 日本的<strong>海啸逃生教育</strong>值得学习"}],wildfire:[{title:"中国森林防火条例",icon:"📜",content:"森林防火相关法规：<br><br><strong>防火期：</strong><br>🔹 一般为<strong>每年11月1日至次年5月31日</strong><br>🔹 高火险期各地不同<br><br><strong>禁止行为：</strong><br>🔹 在防火区内<strong>野外用火</strong><br>🔹 <strong>烧荒、烧田埂</strong><br>🔹 在林区<strong>吸烟、烧烤</strong><br>🔹 <strong>上坟烧纸</strong>（提倡文明祭扫）<br><br><strong>法律责任：</strong><br>🔹 过失引起森林火灾：<strong>罚款+赔偿</strong><br>🔹 故意放火：<strong>刑事犯罪</strong>，最高可判<strong>死刑</strong><br><br>⚠️ 森林火灾是我国最严重的自然灾害之一，每年造成巨大经济损失！"}],snowstorm:[{title:"暴风雪中的失温急救",icon:"🌡️",content:"失温（体温过低）的识别和急救：<br><br><strong>失温分级：</strong><br>🔹 <strong>轻度</strong>（32-35°C）：剧烈发抖<br>🔹 <strong>中度</strong>（28-32°C）：意识模糊<br>🔹 <strong>重度</strong>（<28°C）：停止发抖，昏迷<br><br><strong>识别症状：</strong><br>🔹 持续<strong>发抖</strong><br>🔹 <strong>说话含糊</strong><br>🔹 <strong>动作不协调</strong><br>🔹 <strong>嗜睡</strong>、意识不清<br><br><strong>急救方法：</strong><br>🔹 脱离寒冷环境<br>🔹 <strong>换上干燥衣物</strong><br>🔹 用<strong>温热物体</strong>（热水袋、体温）温暖躯干<br>🔹 喝<strong>温热甜饮</strong><br>🔹 不要<strong>搓揉四肢</strong>（可能导致心脏骤停）<br><br>⚠️ 失温是冬季户外活动的<strong>头号杀手</strong>！"}],sandstorm:[{title:"全球沙尘暴分布",icon:"🌍",content:"全球主要沙尘暴区域：<br><br><strong>非洲：</strong><br>🔹 <strong>撒哈拉沙漠</strong>：全球最大沙源<br>🔹 沙尘可飘过大西洋到达<strong>美洲</strong><br><br><strong>亚洲：</strong><br>🔹 <strong>戈壁沙漠</strong>：影响中国北方<br>🔹 <strong>塔克拉玛干沙漠</strong>：中国最大沙漠<br><br><strong>中东：</strong><br>🔹 <strong>阿拉伯沙漠</strong><br><br><strong>澳大利亚：</strong><br>🔹 <strong>内陆沙漠</strong><br><br><strong>气候变化影响：</strong><br>🔹 全球变暖导致<strong>干旱加剧</strong><br>🔹 过度放牧和<strong>荒漠化扩大</strong><br>🔹 沙尘暴<strong>频率和强度</strong>可能增加<br><br>⚠️ 防治荒漠化是全球性挑战！"}]};