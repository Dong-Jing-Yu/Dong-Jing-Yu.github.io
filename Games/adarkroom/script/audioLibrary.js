/**
 * 音频库模块 - 定义所有音频文件路径
 */
var AudioLibrary = {
    // 背景音乐
    MUSIC_DUSTY_PATH: 'audio/dusty-path.flac',          // 尘土小径
    MUSIC_SILENT_FOREST: 'audio/silent-forest.flac',    // 寂静森林
    MUSIC_LONELY_HUT: 'audio/lonely-hut.flac',          // 孤独小屋
    MUSIC_TINY_VILLAGE: 'audio/tiny-village.flac',      // 小村庄
    MUSIC_MODEST_VILLAGE: 'audio/modest-village.flac',  // 中等村庄
    MUSIC_LARGE_VILLAGE: 'audio/large-village.flac',    // 大村庄
    MUSIC_RAUCOUS_VILLAGE: 'audio/raucous-village.flac',// 喧闹村庄
    
    // 火焰状态音乐
    MUSIC_FIRE_DEAD: 'audio/fire-dead.flac',            // 火焰熄灭
    MUSIC_FIRE_SMOLDERING: 'audio/fire-smoldering.flac',// 火焰闷燃
    MUSIC_FIRE_FLICKERING: 'audio/fire-flickering.flac',// 火焰摇曳
    MUSIC_FIRE_BURNING: 'audio/fire-burning.flac',      // 火焰燃烧
    MUSIC_FIRE_ROARING: 'audio/fire-roaring.flac',      // 火焰旺盛
    
    // 场景音乐
    MUSIC_WORLD: 'audio/world.flac',                    // 世界地图
    MUSIC_SPACE: 'audio/space.flac',                    // 太空
    MUSIC_ENDING: 'audio/ending.flac',                  // 结局
    MUSIC_SHIP: 'audio/ship.flac',                      // 飞船
    
    // 事件音效
    EVENT_NOMAD: 'audio/event-nomad.flac',              // 游牧者事件
    EVENT_NOISES_OUTSIDE: 'audio/event-noises-outside.flac', // 外面的声音
    EVENT_NOISES_INSIDE: 'audio/event-noises-inside.flac',   // 里面的声音
    EVENT_BEGGAR: 'audio/event-beggar.flac',            // 乞丐事件
    EVENT_SHADY_BUILDER: 'audio/event-shady-builder.flac',   // 可疑建造者
    EVENT_MYSTERIOUS_WANDERER: 'audio/event-mysterious-wanderer.flac', // 神秘流浪者
    EVENT_SCOUT: 'audio/event-scout.flac',              // 侦察兵事件
    EVENT_WANDERING_MASTER: 'audio/event-wandering-master.flac', // 流浪大师
    EVENT_SICK_MAN: 'audio/event-sick-man.flac',        // 病人事件
    EVENT_RUINED_TRAP: 'audio/event-ruined-trap.flac',  // 陷阱损坏
    EVENT_HUT_FIRE: 'audio/event-hut-fire.flac',        // 小屋失火
    EVENT_SICKNESS: 'audio/event-sickness.flac',        // 疾病事件
    EVENT_PLAGUE: 'audio/event-plague.flac',            // 瘟疫事件
    EVENT_BEAST_ATTACK: 'audio/event-beast-attack.flac',// 野兽袭击
    EVENT_SOLDIER_ATTACK: 'audio/event-soldier-attack.flac', // 士兵袭击
    EVENT_THIEF: 'audio/event-thief.flac',              // 盗贼事件
    
    // 地标音效
    LANDMARK_FRIENDLY_OUTPOST: 'audio/landmark-friendly-outpost.flac', // 友好前哨
    LANDMARK_SWAMP: 'audio/landmark-swamp.flac',        // 沼泽
    LANDMARK_CAVE: 'audio/landmark-cave.flac',          // 洞穴
    LANDMARK_TOWN: 'audio/landmark-town.flac',          // 小镇
    LANDMARK_CITY: 'audio/landmark-city.flac',          // 城市
    LANDMARK_HOUSE: 'audio/landmark-house.flac',        // 房屋
    LANDMARK_BATTLEFIELD: 'audio/landmark-battlefield.flac', // 战场
    LANDMARK_BOREHOLE: 'audio/landmark-borehole.flac',  // 钻孔
    LANDMARK_CRASHED_SHIP: 'audio/landmark-crashed-ship.flac', // 坠毁飞船
    LANDMARK_SULPHUR_MINE: 'audio/landmark-sulphurmine.flac',  // 硫磺矿
    LANDMARK_COAL_MINE: 'audio/landmark-coalmine.flac', // 煤矿
    LANDMARK_IRON_MINE: 'audio/landmark-ironmine.flac', // 铁矿
    LANDMARK_DESTROYED_VILLAGE: 'audio/landmark-destroyed-village.flac', // 被毁村庄
    
    // 战斗音效
    ENCOUNTER_TIER_1: 'audio/encounter-tier-1.flac',    // 一级遭遇
    ENCOUNTER_TIER_2: 'audio/encounter-tier-2.flac',    // 二级遭遇
    ENCOUNTER_TIER_3: 'audio/encounter-tier-3.flac',    // 三级遭遇
    
    // 动作音效
    LIGHT_FIRE: 'audio/light-fire.flac',                // 点火
    STOKE_FIRE: 'audio/stoke-fire.flac',                // 添柴
    BUILD: 'audio/build.flac',                          // 建造
    CRAFT: 'audio/craft.flac',                          // 制作
    BUY: 'audio/buy.flac',                              // 购买
    GATHER_WOOD: 'audio/gather-wood.flac',              // 收集木材
    CHECK_TRAPS: 'audio/check-traps.flac',              // 检查陷阱
    EMBARK: 'audio/embark.flac',                        // 出发
    
    // 脚步声音效
    FOOTSTEPS_1: 'audio/footsteps-1.flac',              // 脚步声1
    FOOTSTEPS_2: 'audio/footsteps-2.flac',              // 脚步声2
    FOOTSTEPS_3: 'audio/footsteps-3.flac',              // 脚步声3
    FOOTSTEPS_4: 'audio/footsteps-4.flac',              // 脚步声4
    FOOTSTEPS_5: 'audio/footsteps-5.flac',              // 脚步声5
    FOOTSTEPS_6: 'audio/footsteps-6.flac',              // 脚步声6
    
    // 生存动作音效
    EAT_MEAT: 'audio/eat-meat.flac',                    // 吃肉
    USE_MEDS: 'audio/use-meds.flac',                    // 使用药物
    
    // 武器音效
    WEAPON_UNARMED_1: 'audio/weapon-unarmed-1.flac',    // 徒手攻击1
    WEAPON_UNARMED_2: 'audio/weapon-unarmed-2.flac',    // 徒手攻击2
    WEAPON_UNARMED_3: 'audio/weapon-unarmed-3.flac',    // 徒手攻击3
    WEAPON_MELEE_1: 'audio/weapon-melee-1.flac',        // 近战武器1
    WEAPON_MELEE_2: 'audio/weapon-melee-2.flac',        // 近战武器2
    WEAPON_MELEE_3: 'audio/weapon-melee-3.flac',        // 近战武器3
    WEAPON_RANGED_1: 'audio/weapon-ranged-1.flac',      // 远程武器1
    WEAPON_RANGED_2: 'audio/weapon-ranged-2.flac',      // 远程武器2
    WEAPON_RANGED_3: 'audio/weapon-ranged-3.flac',      // 远程武器3
    
    // 特殊音效
    DEATH: 'audio/death.flac',                          // 死亡
    
    // 飞船音效
    REINFORCE_HULL: 'audio/reinforce-hull.flac',        // 加固船体
    UPGRADE_ENGINE: 'audio/upgrade-engine.flac',        // 升级引擎
    LIFT_OFF: 'audio/lift-off.flac',                    // 起飞
    CRASH: 'audio/crash.flac',                          // 坠毁
    
    // 小行星撞击音效
    ASTEROID_HIT_1: 'audio/asteroid-hit-1.flac',        // 小行星撞击1
    ASTEROID_HIT_2: 'audio/asteroid-hit-2.flac',        // 小行星撞击2
    ASTEROID_HIT_3: 'audio/asteroid-hit-3.flac',        // 小行星撞击3
    ASTEROID_HIT_4: 'audio/asteroid-hit-4.flac',        // 小行星撞击4
    ASTEROID_HIT_5: 'audio/asteroid-hit-5.flac',        // 小行星撞击5
    ASTEROID_HIT_6: 'audio/asteroid-hit-6.flac',        // 小行星撞击6
    ASTEROID_HIT_7: 'audio/asteroid-hit-7.flac',        // 小行星撞击7
    ASTEROID_HIT_8: 'audio/asteroid-hit-8.flac'         // 小行星撞击8
};