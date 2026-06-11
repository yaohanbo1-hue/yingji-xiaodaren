/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 应急包数据定义
 * ===========================================================================
 * 
 * 【应急包物品评分标准】
 * necessity 评分 (1-10):
 * 10分: 饮用水、急救包、手电筒（生存必需）
 * 8-9分: 食物、口哨、口罩（重要物品）
 * 6-7分: 毛毯、手套、备用电池（有用物品）
 * 4-5分: 现金、身份证、备用钥匙（重要但非紧急）
 * 1-3分: 零食、玩具、装饰品（非必要物品）
 * 
 * 【游戏机制】
 * 玩家需要在限定时间内选择正确的物品放入应急包，
 * 选择的物品 necessity 总分越高，得分越高。
 * 错误选择低分物品会扣分。
 * 
 * 【模块说明】
 * KitData 定义了应急包整理小游戏中使用的所有物品数据，
 * 包括物品名称、图标、分类、必要性评分等。
 * 
 * 【数据结构】
 * KIT_ITEMS = [
 *   {
 *     id: "water",              // 唯一标识
 *     name: "饮用水",            // 物品名称
 *     icon: "💧",               // 图标 emoji
 *     category: "生存必需",       // 分类
 *     necessity: 10,            // 必要性评分 (1-10)
 *     description: "...",       // 描述
 *     weight: 1,                // 重量等级
 *     disasters: ["earthquake", "flood"] // 适用灾害类型
 *   }
 * ]
 * 
 * 【物品分类】
 * - 生存必需: 水、食物、急救包
 * - 防护装备: 口罩、手套、安全帽
 * - 通讯工具: 手机、手电筒、哨子
 * - 重要文件: 身份证、银行卡、保险单
 * - 其他物品: 毛毯、现金、备用钥匙
 * 
 * @version 1.1.0
 * @date 2026-06-05
 * @author 应急小达人开发团队
 * ===========================================================================
 */
const KIT_DATA=[{id:"earthquake",icon:"🌍",name:"地震应急包",time:30,slots:6,items:[{name:"饮用水",icon:"💧",correct:!0,tip:"地震后供水可能中断，饮用水是必需品"},{name:"压缩饼干",icon:"🍪",correct:!0,tip:"高能量食品，轻便易储存"},{name:"手电筒",icon:"🔦",correct:!0,tip:"震后可能停电，手电筒必备"},{name:"急救包",icon:"🩹",correct:!0,tip:"受伤时急救处理"},{name:"哨子",icon:"📯",correct:!0,tip:"被困时吹哨求救，比喊叫更省力"},{name:"防尘口罩",icon:"😷",correct:!0,tip:"过滤地震产生的粉尘"},{name:"毛绒玩具",icon:"🧸",correct:!1,tip:"占空间且无实际用途"},{name:"化妆品",icon:"💄",correct:!1,tip:"应急包不需要化妆品"},{name:"漫画书",icon:"📚",correct:!1,tip:"占背包空间，非必需品"},{name:"玻璃杯",icon:"🥛",correct:!1,tip:"玻璃制品易碎，不适合应急包"}]},{id:"flood",icon:"🌊",name:"洪水应急包",time:30,slots:6,items:[{name:"饮用水",icon:"💧",correct:!0,tip:"洪水可能污染水源"},{name:"高热量食品",icon:"🍫",correct:!0,tip:"补充体力"},{name:"手电筒",icon:"🔦",correct:!0,tip:"洪水可能导致停电"},{name:"救生哨",icon:"📯",correct:!0,tip:"被困时求救信号"},{name:"防水袋",icon:"👜",correct:!0,tip:"保护重要物品不被浸湿"},{name:"保暖衣物",icon:"🧥",correct:!0,tip:"洪水后体温过低很危险"},{name:"雨伞",icon:"☂️",correct:!1,tip:"洪水中伞没用，反而碍事"},{name:"沙滩拖鞋",icon:"🩴",correct:!1,tip:"洪水中拖鞋易被冲走"},{name:"手机充电器",icon:"🔌",correct:!1,tip:"停电了没法充电"},{name:"宠物玩具",icon:"🎾",correct:!1,tip:"不是应急必需品"}]},{id:"typhoon",icon:"🌪️",name:"台风应急包",time:30,slots:6,items:[{name:"饮用水",icon:"💧",correct:!0,tip:"台风可能导致供水中断"},{name:"干粮",icon:"🍞",correct:!0,tip:"无需加热即可食用"},{name:"手电筒",icon:"🔦",correct:!0,tip:"台风必停电"},{name:"备用电池",icon:"🔋",correct:!0,tip:"手电筒和收音机需要电池"},{name:"胶带",icon:"📦",correct:!0,tip:"加固窗户贴米字防碎"},{name:"雨衣",icon:"🧥",correct:!0,tip:"比雨伞更适合台风天"},{name:"吹风机",icon:"💨",correct:!1,tip:"停电了用不了"},{name:"遮阳帽",icon:"🧢",correct:!1,tip:"台风天不需要遮阳"},{name:"杂志",icon:"📰",correct:!1,tip:"非必需品，占空间"},{name:"空花盆",icon:"🪴",correct:!1,tip:"完全不需要"}]},{id:"wildfire",icon:"🔥",name:"山火应急包",time:30,slots:6,items:[{name:"饮用水",icon:"💧",correct:!0,tip:"山火区域水源可能被污染"},{name:"湿毛巾",icon:"🧣",correct:!0,tip:"捂住口鼻过滤浓烟"},{name:"护目镜",icon:"🥽",correct:!0,tip:"保护眼睛免受烟尘伤害"},{name:"手电筒",icon:"🔦",correct:!0,tip:"浓烟导致能见度极低"},{name:"长袖衣物",icon:"👕",correct:!0,tip:"保护皮肤不被火星灼伤"},{name:"口罩",icon:"😷",correct:!0,tip:"过滤有毒烟雾"},{name:"防晒霜",icon:"🧴",correct:!1,tip:"撤离时不需要防晒"},{name:"凉鞋",icon:"🩴",correct:!1,tip:"应穿包脚的鞋防止烫伤"},{name:"游泳圈",icon:"🛟",correct:!1,tip:"山火中完全无用"},{name:"冰激凌",icon:"🍦",correct:!1,tip:"会融化！非必需品"}]},{id:"snowstorm",icon:"❄️",name:"暴雪应急包",time:30,slots:6,items:[{name:"保暖毯",icon:"🛌",correct:!0,tip:"暴雪中保暖是第一要务"},{name:"热水壶",icon:"🫖",correct:!0,tip:"储存热水和融雪取水"},{name:"高热量食品",icon:"🍫",correct:!0,tip:"寒冷天气需要更多能量"},{name:"手电筒",icon:"🔦",correct:!0,tip:"暴雪可能摧毁电力设施"},{name:"厚袜子",icon:"🧦",correct:!0,tip:"防止冻伤脚趾"},{name:"蜡烛火柴",icon:"🕯️",correct:!0,tip:"停电时取暖和照明"},{name:"电风扇",icon:"🌀",correct:!1,tip:"暴雪天不需要风扇"},{name:"短袖T恤",icon:"👕",correct:!1,tip:"保暖才是关键"},{name:"太阳镜",icon:"🕶️",correct:!1,tip:"虽然不是最紧要的，但雪盲症确实需要..."},{name:"人字拖",icon:"🩴",correct:!1,tip:"冻脚！完全不合适"}]}];