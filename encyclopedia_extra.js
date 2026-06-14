/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 防灾百科核心引擎
 * ===========================================================================
 * 
 * 【百科引擎功能详解】
 * 
 * 1. 内容渲染
 *    - 使用虚拟滚动优化长列表性能
 *    - 图片懒加载减少初始加载时间
 *    - 支持 Markdown 格式内容解析
 * 
 * 2. 搜索功能
 *    - 实时搜索，输入时过滤
 *    - 关键词高亮显示
 *    - 支持拼音搜索 (pinyin-match)
 * 
 * 3. 进度追踪
 *    - localStorage 存储阅读状态
 *    - 已读文章显示绿色标记
 *    - 阅读进度百分比显示
 * 
 * 4. 测验系统
 *    - 每篇文章附带 3-5 道测验题
 *    - 答对获得金币奖励
 *    - 错题收藏到"我的错题"
 * 
 * 【模块说明】
 * EncyclopediaEngine 是防灾百科系统的核心引擎，
 * 负责内容渲染、分类过滤、搜索、阅读进度追踪等功能。
 * 
 * 【核心功能】
 * 1. render()          - 渲染百科主页
 * 2. renderCategory()  - 渲染分类文章列表
 * 3. renderArticle()   - 渲染单篇文章详情
 * 4. filter()          - 按灾害类型过滤
 * 5. search()          - 关键词搜索
 * 6. trackProgress()   - 阅读进度追踪
 * 7. completeQuiz()    - 完成文章测验
 * 
 * 【UI 组件】
 * - 文章卡片: 玻璃态设计 + 悬停 3D 效果
 * - 分类标签: 彩色图标 + 文章计数
 * - 进度条: 阅读完成度可视化
 * - 搜索框: 实时过滤 + 高亮匹配
 * 
 * 【数据存储】
 * 使用 localStorage 存储:
 * - 已读文章列表
 * - 测验成绩
 * - 阅读时长统计
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
const EXTRA_ENCYCLOPEDIA={earthquake:[{title:"全球主要地震带",icon:"🗺️",content:"全球有两大主要地震带：<br><br>🔹 <strong>环太平洋地震带</strong>：全球80%的地震发生在这里<br>🔹 <strong>地中海-喜马拉雅地震带</strong>：全球15%的地震<br><br>中国位于两大地震带交汇处：<br>🔹 台湾位于环太平洋地震带<br>🔹 西藏、云南位于地中海-喜马拉雅地震带<br>🔹 华北地区地震活动频繁<br><br>⚠️ 中国有<strong>约58%的国土面积</strong>处于7度以上地震设防区。"},{title:"地震应急包清单",icon:"🎒",content:"每个家庭都应该准备地震应急包：<br><br><strong>必备物品：</strong><br>🔹 饮用水（每人每天<strong>3升</strong>，备3天）<br>🔹 压缩饼干/罐头食品<br>🔹 手电筒 + 备用电池<br>🔹 急救药品（创可贴、纱布、消毒液）<br>🔹 哨子（求救用）<br>🔹 现金（小面额）<br>🔹 身份证复印件<br>🔹 保暖毯<br><br><strong>可选物品：</strong><br>🔹 备用手机充电宝<br>🔹 防水袋<br>🔹 多功能刀<br>🔹 口哨<br><br>⚠️ 每<strong>6个月</strong>检查一次应急包，更换过期物品。"},{title:"地震中的自救互救",icon:"🤝",content:"被埋压后的自救方法：<br><br>🔹 <strong>保存体力</strong>：不要持续大声呼救，间歇性敲击管道或墙壁<br>🔹 <strong>保持呼吸</strong>：用衣物捂住口鼻，防止吸入粉尘<br>🔹 <strong>寻找水源</strong>：如果有水管，可以获取饮用水<br>🔹 <strong>扩大空间</strong>：小心移除压在身上的重物<br><br>互救原则：<br>🔹 <strong>先救近、后救远</strong><br>🔹 <strong>先救易、后救难</strong><br>🔹 <strong>先救活、后救伤</strong><br>🔹 使用<strong>生命探测仪</strong>或<strong>搜救犬</strong>定位被困者"},{title:"地震谣言识别",icon:"📰",content:'如何识别地震谣言：<br><br>❌ <strong>准确预测时间地点</strong> → 目前科学无法精确预测<br>❌ <strong>"某某权威人士说"</strong> → 官方预警只通过正式渠道发布<br>❌ <strong>"不转不是中国人"</strong> → 典型的谣言传播话术<br>❌ <strong>"XX点XX分发生"</strong> → 谣言常用表述<br><br>✅ 正确做法：<br>🔹 关注<strong>中国地震台网</strong>官方发布<br>🔹 关注<strong>当地政府</strong>的正式通知<br>🔹 不信谣、不传谣<br>🔹 做好日常防震准备比关注谣言更重要'}],fire:[{title:"灭火器使用口诀",icon:"🧯",content:"灭火器使用四字口诀：<strong>提、拔、握、压</strong><br><br>🔹 <strong>提</strong>：提起灭火器<br>🔹 <strong>拔</strong>：拔掉保险销<br>🔹 <strong>握</strong>：握住喷管对准火源根部<br>🔹 <strong>压</strong>：按下压把喷射<br><br>⚠️ 注意事项：<br>🔹 站在<strong>上风方向</strong>（风从背后吹来）<br>🔹 距离火源<strong>3-5米</strong><br>🔹 对准<strong>火根</strong>而不是火焰<br>🔹 由外向内扫射<br><br>不同类型火灾选不同灭火器：<br>🔹 <strong>干粉灭火器</strong>：最通用<br>🔹 <strong>CO₂灭火器</strong>：电器火灾<br>🔹 <strong>泡沫灭火器</strong>：油类火灾<br>❌ <strong>水基灭火器</strong>：不能用于电器和油类火灾"},{title:"厨房防火知识",icon:"🍳",content:"厨房是家庭火灾高发区：<br><br><strong>油锅起火：</strong><br>❌ 不能用水浇（会爆炸性飞溅！）<br>✅ 关火 + 盖锅盖 + 放蔬菜<br>✅ 用灭火毯或湿毛巾覆盖<br><br><strong>预防措施：</strong><br>🔹 烧菜时<strong>不要离开</strong><br>🔹 定期清洗<strong>油烟机</strong><br>🔹 燃气管路<strong>定期检查</strong><br>🔹 不要在厨房堆放<strong>易燃物品</strong><br>🔹 安装<strong>烟雾报警器</strong><br><br>⚠️ 微波炉不能加热<strong>鸡蛋、密封容器、金属</strong>！"},{title:"学校消防安全",icon:"🏫",content:"学校消防要点：<br><br><strong>教学楼：</strong><br>🔹 熟悉<strong>安全出口</strong>位置<br>🔹 不要堵占<strong>消防通道</strong><br>🔹 发现火情立即<strong>报告老师</strong><br>🔹 按照<strong>疏散路线</strong>有序撤离<br><br><strong>宿舍：</strong><br>❌ 不使用<strong>违规电器</strong>（热得快、电热毯）<br>❌ 不在宿舍<strong>点蜡烛</strong><br>❌ 不<strong>私拉电线</strong><br>✅ 离开时<strong>关闭电源</strong><br><br>⚠️ 每学期至少参加<strong>2次</strong>消防演练！"}],flood:[{title:"洪水自救互救",icon:"🚑",content:"被困洪水时的自救方法：<br><br><strong>如果在室内：</strong><br>🔹 转移到<strong>楼上或屋顶</strong><br>🔹 关闭<strong>电源和煤气</strong><br>🔹 用<strong>鲜艳衣物</strong>发出求救信号<br>🔹 不要尝试<strong>游泳逃生</strong>（水流可能很急）<br><br><strong>如果在室外：</strong><br>🔹 远离<strong>电线杆和变压器</strong><br>🔹 不要<strong>趟过深水</strong>（可能有暗流或坑洞）<br>🔹 寻找<strong>高地</strong>避难<br>🔹 使用<strong>绳索</strong>互相连接<br><br>⚠️ 洪水中<strong>6厘米深</strong>的急流就能把人冲倒！"},{title:"灾后防疫知识",icon:"🦠",content:"洪水退去后防疫要点：<br><br><strong>饮用水安全：</strong><br>🔹 只喝<strong>瓶装水或煮沸水</strong><br>🔹 井水使用前必须<strong>消毒</strong><br>🔹 不喝<strong>来源不明</strong>的水<br><br><strong>环境卫生：</strong><br>🔹 清理积水<strong>防止蚊虫滋生</strong><br>🔹 动物尸体<strong>深埋处理</strong><br>🔹 室内<strong>消毒通风</strong><br><br><strong>饮食安全：</strong><br>🔹 被浸泡的食物<strong>全部丢弃</strong><br>🔹 食物<strong>彻底加热</strong>后食用<br>🔹 注意<strong>洗手</strong>卫生<br><br>⚠️ 洪灾后最容易爆发<strong>霍乱、伤寒、痢疾</strong>等肠道传染病。"}],typhoon:[{title:"台风防御全攻略",icon:"🛡️",content:"台风来临时的全面防御：<br><br><strong>室外准备：</strong><br>🔹 收回阳台上的<strong>花盆、晾衣架</strong><br>🔹 加固门窗（用<strong>胶带贴米字</strong>）<br>🔹 固定或移走<strong>室外物品</strong><br>🔹 清理<strong>排水管道</strong>防止积水<br><br><strong>室内准备：</strong><br>🔹 储备<strong>食物、水、药品</strong><br>🔹 准备<strong>手电筒、收音机</strong><br>🔹 充满<strong>手机和充电宝</strong><br>🔹 关闭门窗，拉上<strong>窗帘</strong><br><br><strong>出行注意：</strong><br>🔹 <strong>停止一切户外活动</strong><br>🔹 远离<strong>海边、河边、低洼地带</strong><br>🔹 <strong>不要开车</strong>经过积水路段<br>🔹 避开<strong>广告牌、大树、电线杆</strong>"},{title:"台风过后注意事项",icon:"🔧",content:"台风过后的安全检查：<br><br><strong>房屋检查：</strong><br>🔹 检查<strong>门窗、屋顶</strong>是否损坏<br>🔹 检查<strong>燃气管道</strong>是否泄漏<br>🔹 检查<strong>电路</strong>是否安全<br><br><strong>外出注意：</strong><br>🔹 穿<strong>雨靴</strong>防止被碎片割伤<br>🔹 远离<strong>倒塌的树木和电线杆</strong><br>🔹 不要进入<strong>受损严重的建筑</strong><br>🔹 注意<strong>路面积水</strong>可能有漏电<br><br><strong>饮食安全：</strong><br>🔹 检查食物是否被污染<br>🔹 只喝<strong>瓶装水或煮沸水</strong><br>🔹 冰箱停电超过<strong>4小时</strong>的食物要丢弃"}],landslide:[{title:"滑坡泥石流逃生指南",icon:"🏃",content:"滑坡/泥石流逃生要点：<br><br><strong>识别前兆：</strong><br>🔹 山体出现<strong>新裂缝</strong><br>🔹 泉水突然<strong>干涸或变浑</strong><br>🔹 树木<strong>倾斜</strong>（醉汉林）<br>🔹 地面发出<strong>轰隆声</strong><br>🔹 山坡有<strong>石头滚落</strong><br><br><strong>逃生方向：</strong><br>✅ 向<strong>两侧</strong>跑（垂直于滑动方向）<br>❌ 不要<strong>顺着</strong>滑坡方向跑<br>❌ 不要<strong>逆着</strong>滑坡方向跑<br><br><strong>被困时：</strong><br>🔹 用<strong>硬物护住头部</strong><br>🔹 保存体力等待救援<br>🔹 间歇性<strong>敲击求救</strong>"},{title:"易发滑坡地区识别",icon:"📍",content:"哪些地区容易发生滑坡：<br><br><strong>地形因素：</strong><br>🔹 <strong>陡坡</strong>（大于25度）<br>🔹 <strong>山谷出口</strong><br>🔹 <strong>河流两岸</strong><br>🔹 <strong>公路边坡</strong><br><br><strong>土壤因素：</strong><br>🔹 <strong>松散土层</strong>覆盖在坚硬岩石上<br>🔹 <strong>风化严重</strong>的岩石区域<br><br><strong>诱发因素：</strong><br>🔹 暴雨（最常见的诱因）<br>🔹 地震<br>🔹 人工开挖坡脚<br>🔹 不合理灌溉<br><br>⚠️ 在这些地区建房要进行<strong>地质灾害评估</strong>！"}],tornado:[{title:"龙卷风来了如何保命",icon:"🆘",content:"<strong>在家中：</strong><br>🔹 立即躲到<strong>地下室</strong>或<strong>最内侧小房间</strong><br>🔹 远离窗户<br>🔹 躲在<strong>浴缸</strong>下或<strong>坚固桌子</strong>下<br>🔹 用<strong>枕头/被子</strong>护住头部<br><br><strong>在车内：</strong><br>🔹 <strong>不要试图驾车逃离</strong><br>🔹 迅速下车寻找坚固建筑<br>🔹 如果来不及，趴在路边低洼处<br><br><strong>在室外：</strong><br>🔹 趴在地上，双手护头<br>🔹 远离汽车、树木、电线杆<br>🔹 寻找低洼地带<br><br>⚠️ 龙卷风经过时不要试图看它！"}],snowstorm:[{title:"暴风雪出行安全",icon:"🚗",content:"暴风雪天气出行注意事项：<br><br><strong>驾车：</strong><br>🔹 清理<strong>车窗积雪</strong>（前后左右）<br>🔹 安装<strong>防滑链</strong><br>🔹 保持<strong>车距</strong>（平时的3-4倍）<br>🔹 <strong>低速行驶</strong>，避免急刹<br>🔹 车内备<strong>毛毯、食物、水</strong><br><br><strong>步行：</strong><br>🔹 穿<strong>防滑鞋</strong><br>🔹 走<strong>人行道</strong>，避免走机动车道<br>🔹 远离<strong>积雪的建筑物</strong>（屋顶积雪可能掉落）<br>🔹 注意<strong>井盖</strong>可能被积雪覆盖<br><br>⚠️ 暴风雪中<strong>能见度几乎为零</strong>，尽量不出门！"}],wildfire:[{title:"野火逃生路线规划",icon:"🗺️",content:"提前规划野火逃生路线：<br><br><strong>规划要点：</strong><br>🔹 准备<strong>2条以上</strong>逃生路线<br>🔹 路线应通往<strong>开阔地带</strong>或<strong>水域</strong><br>🔹 标记<strong>集合点</strong>（家人走散时的汇合处）<br>🔹 确保所有家庭成员都<strong>知道路线</strong><br><br><strong>车辆准备：</strong><br>🔹 油箱保持<strong>半箱以上</strong><br>🔹 备好<strong>钥匙</strong>随时可以出发<br>🔹 车内备<strong>应急包</strong><br><br><strong>出发前：</strong><br>🔹 穿<strong>长袖、长裤、靴子</strong><br>🔹 带上<strong>口罩和护目镜</strong><br>🔹 关闭<strong>燃气和电源</strong>"}],gas:[{title:"家庭燃气安全指南",icon:"🏠",content:"家庭燃气使用安全：<br><br><strong>日常检查：</strong><br>🔹 每月用<strong>肥皂水</strong>检查管路接口<br>🔹 观察<strong>燃气表</strong>是否异常走动<br>🔹 检查<strong>软管</strong>是否老化（使用寿命2年）<br>🔹 确保<strong>通风良好</strong><br><br><strong>安全使用：</strong><br>🔹 <strong>先开窗后开气</strong><br>🔹 烧水做饭<strong>不要离开</strong><br>🔹 用完后<strong>关闭灶具和阀门</strong><br>🔹 睡前检查<strong>总阀门</strong><br><br><strong>禁止行为：</strong><br>❌ 私自改装燃气管路<br>❌ 使用<strong>直排式热水器</strong><br>❌ 将燃气管<strong>包在墙内</strong><br>❌ 在燃气管道上<strong>悬挂物品</strong>"}],sandstorm:[{title:"沙尘暴对人体的危害",icon:"🫁",content:"沙尘暴对健康的影响：<br><br><strong>呼吸系统：</strong><br>🔹 沙尘颗粒进入<strong>呼吸道</strong><br>🔹 引发<strong>哮喘、支气管炎</strong>加重<br>🔹 长期暴露可导致<strong>肺部疾病</strong><br><br><strong>眼睛：</strong><br>🔹 沙尘进入眼睛导致<strong>结膜炎</strong><br>🔹 <strong>异物感、流泪、红肿</strong><br><br><strong>皮肤：</strong><br>🔹 沙尘摩擦导致<strong>皮肤粗糙</strong><br>🔹 可能引发<strong>过敏性皮炎</strong><br><br><strong>防护建议：</strong><br>🔹 外出戴<strong>N95口罩</strong><br>🔹 戴<strong>护目镜或墨镜</strong><br>🔹 回家后<strong>清洗鼻腔和口腔</strong><br>🔹 使用<strong>加湿器</strong>保持室内湿度"}],nuclear:[{title:"核辐射长期影响",icon:"⚠️",content:"核辐射的长期健康影响：<br><br><strong>短期（数周-数月）：</strong><br>🔹 <strong>急性辐射综合征</strong>（高剂量）<br>🔹 恶心、呕吐、脱发<br>🔹 免疫力下降<br><br><strong>长期（数年-数十年）：</strong><br>🔹 <strong>癌症风险增加</strong>（白血病、甲状腺癌等）<br>🔹 <strong>遗传效应</strong>（可能影响后代）<br>🔹 <strong>白内障</strong><br><br><strong>心理影响：</strong><br>🔹 焦虑、抑郁<br>🔹 创伤后应激障碍（PTSD）<br><br><strong>预防措施：</strong><br>🔹 远离辐射源<br>🔹 定期体检<br>🔹 保持良好心态<br>🔹 加强营养，增强免疫力"},{title:"切尔诺贝利与福岛启示",icon:"📚",content:"历史核事故的教训：<br><br><strong>切尔诺贝利（1986年）：</strong><br>🔹 <strong>操作失误</strong>+设计缺陷导致爆炸<br>🔹 <strong>30公里</strong>范围设为隔离区<br>🔹 影响波及整个欧洲<br>🔹 至今仍是<strong>无人区</strong><br><br><strong>福岛（2011年）：</strong><br>🔹 <strong>海啸</strong>导致冷却系统失效<br>🔹 <strong>30万人</strong>被迫撤离<br>🔹 大量<strong>放射性污水</strong>排入海洋<br><br><strong>共同教训：</strong><br>🔹 核安全<strong>永远是第一位</strong><br>🔹 需要<strong>冗余安全系统</strong><br>🔹 公众需要<strong>透明的信息</strong><br>🔹 应急预案<strong>必须完善</strong>"}],extreme_heat:[{title:"城市热岛效应",icon:"🏙️",content:"城市为什么更热：<br><br><strong>热岛效应成因：</strong><br>🔹 <strong>混凝土和沥青</strong>吸收大量热量<br>🔹 <strong>空调外机</strong>排放热量<br>🔹 <strong>汽车尾气</strong>产生热量<br>🔹 <strong>绿地减少</strong>蒸散降温减弱<br>🔹 <strong>建筑密集</strong>阻碍空气流通<br><br><strong>城市温度比郊区高2-8°C！</strong><br><br><strong>缓解方法：</strong><br>🔹 增加<strong>城市绿地</strong>和<strong>水体</strong><br>🔹 推广<strong>绿色屋顶</strong><br>🔹 使用<strong>反射率高</strong>的建筑材料<br>🔹 合理规划<strong>城市通风廊道</strong><br>🔹 减少<strong>人工热源</strong>排放"},{title:"热射病急救方法",icon:"🏥",content:"热射病是最严重的中暑类型：<br><br><strong>识别症状：</strong><br>🔹 体温<strong>>40°C</strong><br>🔹 <strong>意识模糊</strong>、胡言乱语<br>🔹 <strong>皮肤发红发烫</strong>、不出汗<br>🔹 <strong>脉搏快而弱</strong><br>🔹 可能<strong>抽搐</strong><br><br><strong>急救步骤：</strong><br>🔹 立即<strong>拨打120</strong><br>🔹 将患者移到<strong>阴凉处</strong><br>🔹 用<strong>冰袋</strong>放在颈部、腋下、腹股沟<br>🔹 用<strong>湿毛巾</strong>全身擦拭<br>🔹 如果清醒，让其<strong>小口喝水</strong><br><br>⚠️ 热射病死亡率高达<strong>50%</strong>，必须立即急救！"}]};