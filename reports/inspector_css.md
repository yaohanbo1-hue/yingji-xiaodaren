# Inspector_CSS 报告

## 状态: ✅完成

## 发现的问题:

### 🔴 致命问题
1. **.page display:none 冲突**
   - 描述: 选择器 `.low-perf-mode .page::before,
.low-perf-mode .page::after` 设置了 display:none，可能导致页面无法显示
   - 文件: accessibility.css 行号: 163

2. **.page display:none 冲突**
   - 描述: 选择器 `.low-perf-mode .page::before,
.low-perf-mode .page::after` 设置了 display:none，可能导致页面无法显示
   - 文件: all-styles.css 行号: 164

3. **.page display:none 冲突**
   - 描述: 选择器 `.page:not(.active)` 设置了 display:none，可能导致页面无法显示
   - 文件: all-styles.css 行号: 6565

4. **.page display:none 冲突**
   - 描述: 选择器 `body:not(.app-ready) .page` 设置了 display:none，可能导致页面无法显示
   - 文件: index.html (style tag #1) 行号: 3

5. **.page display:none 冲突**
   - 描述: 选择器 `.page:not(.active)` 设置了 display:none，可能导致页面无法显示
   - 文件: index.html (style tag #1) 行号: 4

6. **.page:not(.active) 多处定义 (3处)**
   - 描述: 多处定义可能导致不可预期的行为
   - 文件: index.html (style tag #1), all-styles.css, transitions.css 行号: 多行

7. **按钮被 pointer-events:none 禁用**
   - 描述: 选择器 `.ai-llm-toggle-btn.llm-loading` 设置了 pointer-events:none，按钮将无法点击
   - 文件: ai-tutor.css 行号: 855

8. **按钮被 pointer-events:none 禁用**
   - 描述: 选择器 `.ai-llm-toggle-btn.llm-loading` 设置了 pointer-events:none，按钮将无法点击
   - 文件: all-styles.css 行号: 1538

9. **按钮被 pointer-events:none 禁用**
   - 描述: 选择器 `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` 设置了 pointer-events:none，按钮将无法点击
   - 文件: all-styles.css 行号: 7343

10. **按钮被 pointer-events:none 禁用**
   - 描述: 选择器 `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` 设置了 pointer-events:none，按钮将无法点击
   - 文件: v5-glass-3d.css 行号: 39

11. **按钮被 pointer-events:none 禁用**
   - 描述: 选择器 `.menu-cat-btn::before` 设置了 pointer-events:none，按钮将无法点击
   - 文件: index.html (style tag #5) 行号: 26

12. **z-index 极端值: 999999**
   - 描述: 选择器 `#loadingScreen` 的 z-index=999999 过高，可能导致层叠混乱
   - 文件: index.html (style tag #2) 行号: 1

13. **同一选择器 display 矛盾设置**
   - 描述: `.back-to-categories` 在不同文件中 display 设置为: ['inline-flex', 'inline-flex', 'none']
   - 文件: index.html (style tag #5), all-styles.css, menu-premium.css 行号: 多行

14. **同一选择器 display 矛盾设置**
   - 描述: `.page:not(.active)` 在不同文件中 display 设置为: ['none !important', 'none!important']
   - 文件: index.html (style tag #1), all-styles.css 行号: 多行

15. **同一选择器 display 矛盾设置**
   - 描述: `.menu-title-decor` 在不同文件中 display 设置为: ['flex!important', 'flex !important']
   - 文件: index.html (style tag #1), index.html (style tag #3) 行号: 多行

16. **同一选择器 display 矛盾设置**
   - 描述: `.title-shield` 在不同文件中 display 设置为: ['flex!important', 'flex !important']
   - 文件: index.html (style tag #1), index.html (style tag #3) 行号: 多行

17. **.menu-toolbar 被 pointer-events:none 禁用**
   - 描述: 选择器 `.menu-toolbar::before` 导致整个菜单栏无法点击
   - 文件: all-styles.css 行号: 7902

18. **按钮样式设置 pointer-events:none**
   - 描述: `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` 无法点击
   - 文件: all-styles.css 行号: 7343

19. **按钮样式设置 pointer-events:none**
   - 描述: `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` 无法点击
   - 文件: v5-glass-3d.css 行号: 39

### 🟡 警告问题
1. **page::after 有 pointer-events:none**
   - 描述: 选择器 `.page::after` - 确保不会意外阻断点击
   - 文件: index.html (style tag #1) 行号: 17

2. **重复的 @keyframes: ai-fab-pulse**
   - 描述: 在 2 个地方定义，文件: ai-float.css, all-styles.css
   - 文件: ai-float.css 行号: 47

3. **重复的 @keyframes: ai-fab-badge-pulse**
   - 描述: 在 2 个地方定义，文件: ai-float.css, all-styles.css
   - 文件: ai-float.css 行号: 52

4. **重复的 @keyframes: ai-panel-slide-in**
   - 描述: 在 2 个地方定义，文件: ai-float.css, all-styles.css
   - 文件: ai-float.css 行号: 82

5. **重复的 @keyframes: ai-msg-fade-in**
   - 描述: 在 2 个地方定义，文件: ai-float.css, all-styles.css
   - 文件: ai-float.css 行号: 210

6. **重复的 @keyframes: cardFadeIn**
   - 描述: 在 4 个地方定义，文件: all-styles.css, transitions.css, ai-tutor.css
   - 文件: ai-tutor.css 行号: 41

7. **重复的 @keyframes: pulse-ring**
   - 描述: 在 2 个地方定义，文件: all-styles.css, ai-tutor.css
   - 文件: ai-tutor.css 行号: 85

8. **重复的 @keyframes: dotPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, ai-tutor.css
   - 文件: ai-tutor.css 行号: 124

9. **重复的 @keyframes: msgFadeIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, ai-tutor.css
   - 文件: ai-tutor.css 行号: 510

10. **重复的 @keyframes: typingBounce**
   - 描述: 在 2 个地方定义，文件: all-styles.css, ai-tutor.css
   - 文件: ai-tutor.css 行号: 728

11. **重复的 @keyframes: bgShift**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1673

12. **重复的 @keyframes: orbFloat1**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1728

13. **重复的 @keyframes: orbFloat2**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1734

14. **重复的 @keyframes: orbFloat3**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1740

15. **重复的 @keyframes: orbFloat4**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1745

16. **重复的 @keyframes: topBarPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1802

17. **重复的 @keyframes: menuSpotlight**
   - 描述: 在 2 个地方定义，文件: all-styles.css, bg-premium.css
   - 文件: all-styles.css 行号: 1857

18. **重复的 @keyframes: starTwinkle**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 1973

19. **重复的 @keyframes: meteorFall1**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 2001

20. **重复的 @keyframes: meteorFall2**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 2007

21. **重复的 @keyframes: meteorFall3**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 2013

22. **重复的 @keyframes: auroraWave**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 2072

23. **重复的 @keyframes: matrixFall**
   - 描述: 在 2 个地方定义，文件: bg-themes.css, all-styles.css
   - 文件: all-styles.css 行号: 2135

24. **重复的 @keyframes: certShine**
   - 描述: 在 2 个地方定义，文件: all-styles.css, cert-enhance.css
   - 文件: all-styles.css 行号: 2383

25. **重复的 @keyframes: certModalIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, cert-enhance.css
   - 文件: all-styles.css 行号: 2396

26. **重复的 @keyframes: certCardFadeIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, certification.css
   - 文件: all-styles.css 行号: 2468

27. **重复的 @keyframes: badgePulse**
   - 描述: 在 4 个地方定义，文件: all-styles.css, menu-enhance.css, certification.css
   - 文件: all-styles.css 行号: 2498

28. **重复的 @keyframes: modalFadeIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, certification.css
   - 文件: all-styles.css 行号: 2741

29. **重复的 @keyframes: pulse-glow**
   - 描述: 在 2 个地方定义，文件: clean-ui.css, all-styles.css
   - 文件: all-styles.css 行号: 3201

30. **重复的 @keyframes: neonPulse**
   - 描述: 在 2 个地方定义，文件: clean-ui.css, all-styles.css
   - 文件: all-styles.css 行号: 3202

31. **重复的 @keyframes: glassShimmer**
   - 描述: 在 2 个地方定义，文件: clean-ui.css, all-styles.css
   - 文件: all-styles.css 行号: 3203

32. **重复的 @keyframes: float3D**
   - 描述: 在 2 个地方定义，文件: clean-ui.css, all-styles.css
   - 文件: all-styles.css 行号: 3204

33. **重复的 @keyframes: cardSlideIn**
   - 描述: 在 2 个地方定义，文件: clean-ui.css, all-styles.css
   - 文件: all-styles.css 行号: 3458

34. **重复的 @keyframes: simFadeIn**
   - 描述: 在 2 个地方定义，文件: disaster-sim.css, all-styles.css
   - 文件: all-styles.css 行号: 3567

35. **重复的 @keyframes: phasePulse**
   - 描述: 在 2 个地方定义，文件: disaster-sim.css, all-styles.css
   - 文件: all-styles.css 行号: 3628

36. **重复的 @keyframes: resultSlideIn**
   - 描述: 在 2 个地方定义，文件: disaster-sim.css, all-styles.css
   - 文件: all-styles.css 行号: 3674

37. **重复的 @keyframes: dustRise1**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3903

38. **重复的 @keyframes: dustRise2**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3910

39. **重复的 @keyframes: dustRise3**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3917

40. **重复的 @keyframes: dustRise4**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3924

41. **重复的 @keyframes: dustRise5**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3931

42. **重复的 @keyframes: dustRise6**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3938

43. **重复的 @keyframes: dustRise7**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3945

44. **重复的 @keyframes: dustRise8**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3952

45. **重复的 @keyframes: sweep**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 3978

46. **重复的 @keyframes: geoSpin**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4041

47. **重复的 @keyframes: pulseExpand**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4096

48. **重复的 @keyframes: meteorFall**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4144

49. **重复的 @keyframes: barFlow1**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4185

50. **重复的 @keyframes: barFlow2**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4192

51. **重复的 @keyframes: barFlow3**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4199

52. **重复的 @keyframes: streamFall**
   - 描述: 在 2 个地方定义，文件: all-styles.css, fx-effects.css
   - 文件: all-styles.css 行号: 4323

53. **重复的 @keyframes: guideFadeIn**
   - 描述: 在 2 个地方定义，文件: guide-enhance.css, all-styles.css
   - 文件: all-styles.css 行号: 4348

54. **重复的 @keyframes: guidePulse**
   - 描述: 在 2 个地方定义，文件: guide-enhance.css, all-styles.css
   - 文件: all-styles.css 行号: 4374

55. **重复的 @keyframes: guideTooltipIn**
   - 描述: 在 2 个地方定义，文件: guide-enhance.css, all-styles.css
   - 文件: all-styles.css 行号: 4420

56. **重复的 @keyframes: loadingFadeIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 4859

57. **重复的 @keyframes: loadingFadeOut**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 4864

58. **重复的 @keyframes: loadingLogoEnter**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 4881

59. **重复的 @keyframes: loadingIconPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 4899

60. **重复的 @keyframes: loadingParticleFloat**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 4978

61. **重复的 @keyframes: loadingGlow**
   - 描述: 在 2 个地方定义，文件: all-styles.css, loading.css
   - 文件: all-styles.css 行号: 5003

62. **重复的 @keyframes: rcFadeIn**
   - 描述: 在 2 个地方定义，文件: real-cases.css, all-styles.css
   - 文件: all-styles.css 行号: 5997

63. **重复的 @keyframes: rcSlideIn**
   - 描述: 在 2 个地方定义，文件: real-cases.css, all-styles.css
   - 文件: all-styles.css 行号: 6002

64. **重复的 @keyframes: settingsIconFloat**
   - 描述: 在 2 个地方定义，文件: settings.css, all-styles.css
   - 文件: all-styles.css 行号: 6045

65. **重复的 @keyframes: settingsFadeIn**
   - 描述: 在 2 个地方定义，文件: settings.css, all-styles.css
   - 文件: all-styles.css 行号: 6079

66. **重复的 @keyframes: shareOverlayIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, share.css
   - 文件: all-styles.css 行号: 6394

67. **重复的 @keyframes: shareModalIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, share.css
   - 文件: all-styles.css 行号: 6414

68. **重复的 @keyframes: menuItemSlideIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6597

69. **重复的 @keyframes: headerSlideDown**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6712

70. **重复的 @keyframes: optionFadeIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6739

71. **重复的 @keyframes: loadingPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6769

72. **重复的 @keyframes: successBounce**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6779

73. **重复的 @keyframes: errorShake**
   - 描述: 在 2 个地方定义，文件: all-styles.css, transitions.css
   - 文件: all-styles.css 行号: 6787

74. **重复的 @keyframes: fadeInUp**
   - 描述: 在 2 个地方定义，文件: all-styles.css, ui-ultimate.css
   - 文件: all-styles.css 行号: 7252

75. **重复的 @keyframes: wrongShake3D**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7479

76. **重复的 @keyframes: card3DGlassIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7509

77. **重复的 @keyframes: icon3DGlassFloat**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7534

78. **重复的 @keyframes: exp3DGlassIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7562

79. **重复的 @keyframes: streakPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7652

80. **重复的 @keyframes: combo3DGlassExplode**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7761

81. **重复的 @keyframes: feedback3DGlassIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7790

82. **重复的 @keyframes: result3DGlassIn**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7802

83. **重复的 @keyframes: logo3DGlassGlow**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7814

84. **重复的 @keyframes: menuLogoFloat**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7855

85. **重复的 @keyframes: gradientShift**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7872

86. **重复的 @keyframes: resultPop3D**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 7997

87. **重复的 @keyframes: versionPulse**
   - 描述: 在 2 个地方定义，文件: all-styles.css, v5-glass-3d.css
   - 文件: all-styles.css 行号: 8025

88. **按钮 opacity:0 但可能仍可点击**
   - 描述: `.touch-device .mode-btn:active,
.touch-device .menu-cat-btn:active,
.touch-device .tool-btn:active,
.touch-device .quiz-opt:active,
.touch-device .choice-btn:active` 透明但可能未禁用 pointer-events
   - 文件: accessibility.css 行号: 136

89. **按钮 opacity:0 但可能仍可点击**
   - 描述: `.touch-device .mode-btn:active,
.touch-device .menu-cat-btn:active,
.touch-device .tool-btn:active,
.touch-device .quiz-opt:active,
.touch-device .choice-btn:active` 透明但可能未禁用 pointer-events
   - 文件: all-styles.css 行号: 137

90. **按钮 opacity:0 但可能仍可点击**
   - 描述: `.mode-btn::before` 透明但可能未禁用 pointer-events
   - 文件: all-styles.css 行号: 5352

91. **按钮 opacity:0 但可能仍可点击**
   - 描述: `.mode-btn::before` 透明但可能未禁用 pointer-events
   - 文件: menu-premium.css 行号: 132

### 🟢 建议
1. **大量无限循环动画 (137处)**
   - 描述: 可能导致CPU/GPU高占用，建议在移动设备上减少动画数量

## 修复建议:

### 紧急修复（致命问题）
1. **`.page:not(.active)` 重复定义**: 合并到单一文件，使用 `!important` 统一控制
2. **`pointer-events:none` 在按钮伪元素**: 移除 `::before` 上的 `pointer-events:none`，或改用 `pointer-events: auto` 在父元素
3. **`.menu-toolbar::before`**: 移除 `pointer-events:none`，或用更精确的选择器避免覆盖整个菜单栏
4. **`.back-to-categories` display冲突**: 统一使用 `display: none` 或 `display: inline-flex`，避免在多个文件定义矛盾值
5. **z-index 999999**: 将 `#loadingScreen` 的 z-index 降至 9999 或 10000，避免极端值

### 优化建议（警告问题）
1. **重复 @keyframes**: 由于 `all-styles.css` 是合并版，确认是否为冗余。如果不是合并版，提取公共动画到独立文件
2. **opacity:0 按钮**: 确保透明按钮同时设置 `pointer-events: none` 或禁用点击
3. **大量无限动画**: 在移动端检测 `prefers-reduced-motion`，有条件地禁用装饰性动画

## 数据汇总:
- CSS文件数: 25
- @keyframes总数: 191
- 重复keyframes: 86
- z-index最高值: 999999 (选择器: #loadingScreen)
- pointer-events设置: 81处
- pointer-events:none: 73处
- 致命问题: 19
- 警告: 91
- 建议: 1

## z-index 详细列表

| z-index | 选择器 | 文件 | 行号 |
|--------|--------|------|------|
| 999999 | `}




#loadingScreen` | all-styles.css | 4838 |
| 999999 | `#loadingScreen` | loading.css | 1 |
| 999999 | `#loadingScreen` | index.html (style tag #1) | 1 |
| 999999 | `#loadingScreen` | index.html (style tag #2) | 1 |
| 100000 | `.guide-tooltip` | all-styles.css | 4398 |
| 100000 | `.guide-tooltip` | guide-enhance.css | 63 |
| 99999 | `}





.share-modal-overlay` | all-styles.css | 6375 |
| 99999 | `.share-modal-overlay` | share.css | 1 |
| 10000 | `.cert-modal-overlay` | all-styles.css | 2725 |
| 10000 | `.cert-modal-overlay` | certification.css | 298 |
| 9999 | `.combo-celebration` | all-styles.css | 7746 |
| 9999 | `.combo-celebration` | v5-glass-3d.css | 442 |
| 9999 | `.page::after` | index.html (style tag #1) | 17 |
| 9998 | `}





.menu-mouse-glow` | all-styles.css | 5013 |
| 9998 | `.share-btn-float` | all-styles.css | 6507 |
| 9998 | `.menu-mouse-glow` | menu-enhance.css | 1 |
| 9998 | `.share-btn-float` | share.css | 129 |
| 50 | `}





.guide-overlay` | all-styles.css | 4332 |
| 50 | `.guide-overlay` | guide-enhance.css | 1 |
| 10 | `.bg-top-bar` | all-styles.css | 1777 |
| 10 | `.bg-top-bar` | bg-premium.css | 148 |
| 3 | `.quiz-opt .opt-label, .scenario-opt .opt-label` | all-styles.css | 7396 |
| 3 | `.quiz-opt .opt-text, .scenario-opt .opt-text` | all-styles.css | 7413 |
| 3 | `}


.quiz-question` | all-styles.css | 7538 |
| 3 | `}

.exp-text` | all-styles.css | 7564 |
| 3 | `.tip-text` | all-styles.css | 7574 |
| 3 | `.quiz-opt .opt-label, .scenario-opt .opt-label` | v5-glass-3d.css | 92 |
| 3 | `.quiz-opt .opt-text, .scenario-opt .opt-text` | v5-glass-3d.css | 109 |
| 3 | `}


.quiz-question` | v5-glass-3d.css | 234 |
| 3 | `}

.exp-text` | v5-glass-3d.css | 260 |

## pointer-events 详细列表

| 选择器 | 值 | 文件 | 行号 |
|--------|-----|------|------|
| `.ai-fab` | auto !important | ai-float.css | 1 |
| `}


.ai-float-panel` | auto !important | ai-float.css | 54 |
| `.ai-llm-toggle-btn.llm-loading` | none | ai-tutor.css | 855 |
| `}





.ai-fab` | auto !important | all-styles.css | 260 |
| `}


.ai-float-panel` | auto !important | all-styles.css | 317 |
| `.ai-llm-toggle-btn.llm-loading` | none | all-styles.css | 1538 |
| `}


.bg-orb` | none | all-styles.css | 1679 |
| `}


.bg-grid` | none | all-styles.css | 1748 |
| `.bg-top-bar` | none | all-styles.css | 1777 |
| `}


.bg-vignette` | none | all-styles.css | 1804 |
| `.bg-bottom-glow` | none | all-styles.css | 1815 |
| `#bgCanvas` | none | all-styles.css | 1828 |
| `#page-menu::before` | none | all-styles.css | 1841 |
| `.bg-theme-layer` | none | all-styles.css | 1882 |
| `body.theme-starry-night .bg-stars` | none | all-styles.css | 1919 |
| `}


body.theme-starry-night .bg-meteor` | none | all-styles.css | 1975 |
| `body.theme-aurora-flow .bg-aurora` | none | all-styles.css | 2036 |
| `body.theme-digital-matrix .bg-matrix` | none | all-styles.css | 2113 |
| `}









.fx-layer` | none | all-styles.css | 3808 |
| `.fx-layer *` | none !important | all-styles.css | 3825 |
| `.dust` | none | all-styles.css | 3829 |
| `.geo-ring` | none | all-styles.css | 3993 |
| `.pulse-ring` | none | all-styles.css | 4058 |
| `}


.meteor` | none | all-styles.css | 4098 |
| `}


.gradient-bar` | none | all-styles.css | 4149 |
| `}


.corner-decor` | none | all-styles.css | 4203 |
| `.data-stream` | none | all-styles.css | 4296 |
| `to` | none | all-styles.css | 4865 |
| `.loading-particles` | none | all-styles.css | 4950 |
| `}





.menu-mouse-glow` | none | all-styles.css | 5013 |
| `.menu-card::before,
.mode-card::before` | none | all-styles.css | 5039 |
| `.menu-card::after,
.mode-card::after` | none | all-styles.css | 5061 |
| `.section-header-glow` | none | all-styles.css | 5093 |
| `.page:not(.active)` | none | all-styles.css | 6565 |
| `.modal-overlay:not(.active)` | none | all-styles.css | 6645 |
| `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` | none | all-styles.css | 7343 |
| `.quiz-opt::after, .scenario-opt::after, .quiz-card::after,
.quiz-content::after, .scenario-card::after` | none | all-styles.css | 7356 |
| `}


.quiz-opt.disabled, .scenario-opt.disabled` | none | all-styles.css | 7485 |
| `.combo-celebration` | none | all-styles.css | 7746 |
| `.menu-toolbar::before` | none | all-styles.css | 7902 |
| `}


.bg-orb` | none | bg-premium.css | 50 |
| `}


.bg-grid` | none | bg-premium.css | 119 |
| `.bg-top-bar` | none | bg-premium.css | 148 |
| `}


.bg-vignette` | none | bg-premium.css | 175 |
| `.bg-bottom-glow` | none | bg-premium.css | 186 |
| `#bgCanvas` | none | bg-premium.css | 199 |
| `#page-menu::before` | none | bg-premium.css | 212 |
| `.bg-theme-layer` | none | bg-themes.css | 6 |
| `body.theme-starry-night .bg-stars` | none | bg-themes.css | 43 |
| `}


body.theme-starry-night .bg-meteor` | none | bg-themes.css | 99 |
| `body.theme-aurora-flow .bg-aurora` | none | bg-themes.css | 160 |
| `body.theme-digital-matrix .bg-matrix` | none | bg-themes.css | 237 |
| `.fx-layer` | none | fx-effects.css | 1 |
| `.fx-layer *` | none !important | fx-effects.css | 10 |
| `.dust` | none | fx-effects.css | 14 |
| `.geo-ring` | none | fx-effects.css | 178 |
| `.pulse-ring` | none | fx-effects.css | 243 |
| `}


.meteor` | none | fx-effects.css | 283 |
| `}


.gradient-bar` | none | fx-effects.css | 334 |
| `}


.corner-decor` | none | fx-effects.css | 388 |
| `.data-stream` | none | fx-effects.css | 481 |
| `to` | none | loading.css | 24 |
| `.loading-particles` | none | loading.css | 109 |
| `.menu-mouse-glow` | none | menu-enhance.css | 1 |
| `.menu-card::before,
.mode-card::before` | none | menu-enhance.css | 23 |
| `.menu-card::after,
.mode-card::after` | none | menu-enhance.css | 45 |
| `.section-header-glow` | none | menu-enhance.css | 77 |
| `.page:not(.active)` | none | transitions.css | 8 |
| `.modal-overlay:not(.active)` | none | transitions.css | 87 |
| `.quiz-opt::before, .scenario-opt::before, .quiz-card::before,
.quiz-content::before, .scenario-card::before, .mode-btn::before` | none | v5-glass-3d.css | 39 |
| `.quiz-opt::after, .scenario-opt::after, .quiz-card::after,
.quiz-content::after, .scenario-card::after` | none | v5-glass-3d.css | 52 |
| `}


.quiz-opt.disabled, .scenario-opt.disabled` | none | v5-glass-3d.css | 181 |
| `.combo-celebration` | none | v5-glass-3d.css | 442 |
| `.menu-toolbar::before` | none | v5-glass-3d.css | 598 |
| `#loadingScreen.hidden` | none | index.html (style tag #1) | 2 |
| `.page::after` | none | index.html (style tag #1) | 17 |
| `.menu-logo-title::before` | none | index.html (style tag #1) | 30 |
| `#loadingScreen.hidden` | none | index.html (style tag #2) | 10 |
| `.menu-cat-btn::before` | none | index.html (style tag #5) | 26 |
| `.menu-section` | none !important | index.html (style tag #5) | 70 |
| `.menu-section.expanded` | auto !important | index.html (style tag #5) | 81 |

## .page 相关规则列表

- `.high-contrast .page` → accessibility.css:34
- `.reduced-motion .page` → accessibility.css:107
- `.low-perf-mode .page::before,
.low-perf-mode .page::after` → accessibility.css:163
- `.page` → accessibility.css:197
- `.high-contrast .page` → all-styles.css:35
- `.reduced-motion .page` → all-styles.css:108
- `.low-perf-mode .page::before,
.low-perf-mode .page::after` → all-styles.css:164
- `.page` → all-styles.css:198
- `.page` → all-styles.css:2905
- `.page.active` → all-styles.css:2910
- `.page.exit` → all-styles.css:2915
- `#page-pet.page.active, #page-diary.page.active, #page-workshop.page.active, #page-gacha.page.active` → all-styles.css:4773
- `}





.page` → all-styles.css:6554
- `.page:not(.active)` → all-styles.css:6565
- `.page.active` → all-styles.css:6572
- `.game-header,
.page-header` → all-styles.css:6704
- `.page::-webkit-scrollbar` → all-styles.css:6806
- `.page::-webkit-scrollbar-track` → all-styles.css:6811
- `.page::-webkit-scrollbar-thumb` → all-styles.css:6816
- `.page::-webkit-scrollbar-thumb:hover` → all-styles.css:6822
- `.page-content` → all-styles.css:6826
- `.page-content .game-header` → all-styles.css:6836
- `.page-content .game-header .mode-label` → all-styles.css:6842
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *` → all-styles.css:7244
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(1)` → all-styles.css:7260
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(2)` → all-styles.css:7264
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(3)` → all-styles.css:7265
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(4)` → all-styles.css:7266
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(5)` → all-styles.css:7267
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(6)` → all-styles.css:7268
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(7)` → all-styles.css:7269
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(8)` → all-styles.css:7270
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(9)` → all-styles.css:7271
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(10)` → all-styles.css:7272
- `.page` → all-styles.css:7327
- `.page` → all-styles.css:7930
- `.page.active` → all-styles.css:7935
- `.page` → clean-ui.css:45
- `.page.active` → clean-ui.css:50
- `.page.exit` → clean-ui.css:55
- `#page-pet.page.active, #page-diary.page.active, #page-workshop.page.active, #page-gacha.page.active` → layout-fix.css:134
- `.page` → transitions.css:1
- `.page:not(.active)` → transitions.css:8
- `.page.active` → transitions.css:14
- `.game-header,
.page-header` → transitions.css:146
- `.page::-webkit-scrollbar` → transitions.css:248
- `.page::-webkit-scrollbar-track` → transitions.css:253
- `.page::-webkit-scrollbar-thumb` → transitions.css:258
- `.page::-webkit-scrollbar-thumb:hover` → transitions.css:264
- `.page-content` → ui-ultimate.css:1
- `.page-content .game-header` → ui-ultimate.css:8
- `.page-content .game-header .mode-label` → ui-ultimate.css:14
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *` → ui-ultimate.css:416
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(1)` → ui-ultimate.css:432
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(2)` → ui-ultimate.css:436
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(3)` → ui-ultimate.css:437
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(4)` → ui-ultimate.css:438
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(5)` → ui-ultimate.css:439
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(6)` → ui-ultimate.css:440
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(7)` → ui-ultimate.css:441
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(8)` → ui-ultimate.css:442
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(9)` → ui-ultimate.css:443
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(10)` → ui-ultimate.css:444
- `.page` → v5-glass-3d.css:23
- `.page` → v5-glass-3d.css:626
- `.page.active` → v5-glass-3d.css:631
- `body:not(.app-ready) .page` → index.html (style tag #1):3
- `.page:not(.active)` → index.html (style tag #1):4
- `.page::after` → index.html (style tag #1):17
- `.page` → index.html (style tag #1):19
- `.page-content` → index.html (style tag #1):56

## .menu-toolbar 相关规则

- `.high-contrast .menu-toolbar` → accessibility.css:78
  ```css
  background: #000000 !important;
  border-top: 2px solid #ffffff !important;
  ```
- `.touch-device .menu-toolbar` → accessibility.css:121
  ```css
  padding: 8px !important;
  ```
- `.menu-toolbar` → accessibility.css:229
  ```css
  padding: 4px !important;
  ```
- `.high-contrast .menu-toolbar` → all-styles.css:79
  ```css
  background: #000000 !important;
  border-top: 2px solid #ffffff !important;
  ```
- `.touch-device .menu-toolbar` → all-styles.css:122
  ```css
  padding: 8px !important;
  ```
- `.menu-toolbar` → all-styles.css:230
  ```css
  padding: 4px !important;
  ```
- `body.theme-dawn-light .menu-toolbar,
body.theme-warm-light .menu-toolbar` → all-styles.css:2213
  ```css
  background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.95) 100%) !important;
  border-top: 1px solid rgba(0,0,0,0.08) !important;
  box-shadow: 0 -4px 30px rgba(0,0,0,0.1) !important;
  ```
- `#page-achievements .preview-header ~ div:not(.menu-toolbar)` → all-styles.css:4671
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 12px !important;
  padding: 16px !important;
  max-width: 900px !important;
  margin: 0 auto !important;
  ```
- `#page-achievements .preview-header ~ div:not(.menu-toolbar)` → all-styles.css:4830
  ```css
  grid-template-columns: 1fr !important;
  ```
- `.menu-toolbar .tool-btn` → all-styles.css:6677
  ```css
  position: relative;
  overflow: hidden;
  ```
- `.menu-toolbar .tool-btn::before` → all-styles.css:6683
  ```css
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
  ```
- `.menu-toolbar .tool-btn.active::before` → all-styles.css:6696
  ```css
  width: 60%;
  ```
- `.menu-toolbar .tool-btn:hover::before` → all-styles.css:6700
  ```css
  width: 40%;
  ```
- `#page-achievements > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → all-styles.css:6960
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-character > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → all-styles.css:7038
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
  gap: 16px !important;
  padding: 0 !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → all-styles.css:7118
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-shop > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → all-styles.css:7169
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-character > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → all-styles.css:7222
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → all-styles.css:7226
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-shop > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → all-styles.css:7230
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → all-styles.css:7240
  ```css
  grid-template-columns: 1fr !important;
  ```
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *` → all-styles.css:7244
  ```css
  animation: fadeInUp 0.3s ease backwards;
  ```
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(1)` → all-styles.css:7260
  ```css
  animation-delay: 0.02s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(2)` → all-styles.css:7264
  ```css
  animation-delay: 0.04s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(3)` → all-styles.css:7265
  ```css
  animation-delay: 0.06s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(4)` → all-styles.css:7266
  ```css
  animation-delay: 0.08s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(5)` → all-styles.css:7267
  ```css
  animation-delay: 0.10s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(6)` → all-styles.css:7268
  ```css
  animation-delay: 0.12s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(7)` → all-styles.css:7269
  ```css
  animation-delay: 0.14s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(8)` → all-styles.css:7270
  ```css
  animation-delay: 0.16s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(9)` → all-styles.css:7271
  ```css
  animation-delay: 0.18s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(10)` → all-styles.css:7272
  ```css
  animation-delay: 0.20s;
  ```
- `.menu-toolbar` → all-styles.css:7893
  ```css
  background: linear-gradient(180deg, rgba(12, 12, 35, 0.92) 0%, rgba(8, 8, 24, 0.96) 100%) !important;
  backdrop-filter: blur(28px) saturate(220%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(220%) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5), 0 -10px 50px rgba(0, 212, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  ```
- `.menu-toolbar::before` → all-styles.css:7902
  ```css
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.2) 50%, transparent 100%);
  pointer-events: none;
  z-index: 1;
  ```
- `body.theme-dawn-light .menu-toolbar,
body.theme-warm-light .menu-toolbar` → bg-themes.css:337
  ```css
  background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.95) 100%) !important;
  border-top: 1px solid rgba(0,0,0,0.08) !important;
  box-shadow: 0 -4px 30px rgba(0,0,0,0.1) !important;
  ```
- `#page-achievements .preview-header ~ div:not(.menu-toolbar)` → layout-fix.css:32
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: 12px !important;
  padding: 16px !important;
  max-width: 900px !important;
  margin: 0 auto !important;
  ```
- `#page-achievements .preview-header ~ div:not(.menu-toolbar)` → layout-fix.css:191
  ```css
  grid-template-columns: 1fr !important;
  ```
- `.menu-toolbar .tool-btn` → transitions.css:119
  ```css
  position: relative;
  overflow: hidden;
  ```
- `.menu-toolbar .tool-btn::before` → transitions.css:125
  ```css
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  border-radius: 2px;
  ```
- `.menu-toolbar .tool-btn.active::before` → transitions.css:138
  ```css
  width: 60%;
  ```
- `.menu-toolbar .tool-btn:hover::before` → transitions.css:142
  ```css
  width: 40%;
  ```
- `#page-achievements > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → ui-ultimate.css:132
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-character > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → ui-ultimate.css:210
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
  gap: 16px !important;
  padding: 0 !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → ui-ultimate.css:290
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-shop > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → ui-ultimate.css:341
  ```css
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
  gap: 12px !important;
  padding: 0 !important;
  ```
- `#page-character > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → ui-ultimate.css:394
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → ui-ultimate.css:398
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-shop > div:not(.game-header):not(.back-float):not(.menu-toolbar)` → ui-ultimate.css:402
  ```css
  grid-template-columns: repeat(2, 1fr) !important;
  ```
- `#page-stats > div:not(.game-header):not(.back-float):not(.menu-toolbar):not(.level-bar)` → ui-ultimate.css:412
  ```css
  grid-template-columns: 1fr !important;
  ```
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *` → ui-ultimate.css:416
  ```css
  animation: fadeInUp 0.3s ease backwards;
  ```
- `}


.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(1)` → ui-ultimate.css:432
  ```css
  animation-delay: 0.02s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(2)` → ui-ultimate.css:436
  ```css
  animation-delay: 0.04s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(3)` → ui-ultimate.css:437
  ```css
  animation-delay: 0.06s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(4)` → ui-ultimate.css:438
  ```css
  animation-delay: 0.08s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(5)` → ui-ultimate.css:439
  ```css
  animation-delay: 0.10s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(6)` → ui-ultimate.css:440
  ```css
  animation-delay: 0.12s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(7)` → ui-ultimate.css:441
  ```css
  animation-delay: 0.14s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(8)` → ui-ultimate.css:442
  ```css
  animation-delay: 0.16s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(9)` → ui-ultimate.css:443
  ```css
  animation-delay: 0.18s;
  ```
- `.page-content > div:not(.game-header):not(.back-float):not(.menu-toolbar) > *:nth-child(10)` → ui-ultimate.css:444
  ```css
  animation-delay: 0.20s;
  ```
- `.menu-toolbar` → v5-glass-3d.css:589
  ```css
  background: linear-gradient(180deg, rgba(12, 12, 35, 0.92) 0%, rgba(8, 8, 24, 0.96) 100%) !important;
  backdrop-filter: blur(28px) saturate(220%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(220%) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5), 0 -10px 50px rgba(0, 212, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  ```
- `.menu-toolbar::before` → v5-glass-3d.css:598
  ```css
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.2) 50%, transparent 100%);
  pointer-events: none;
  z-index: 1;
  ```
- `body:not(.app-ready) #menuToolbar,body:not(.app-ready) .menu-toolbar` → index.html (style tag #1):5
  ```css
  display:none!important;
  ```
- `.menu-toolbar` → index.html (style tag #1):6
  ```css
  display:flex!important;
  justify-content:space-around!important;
  align-items:center!important;
  gap:4px!important;
  padding:10px 8px calc(10px + env(safe-area-inset-bottom,0px))!important;
  position:fixed!important;
  bottom:0!important;
  left:0!important;
  right:0!important;
  z-index:10000!important;
  max-width:900px!important;
  margin:0 auto!important;
  background:rgba(12,12,35,0.94)!important;
  backdrop-filter:blur(32px) saturate(240%)!important;
  -webkit-backdrop-filter:blur(32px) saturate(240%)!important;
  border-top:1px solid rgba(0,212,255,0.15)!important;
  border-top-left-radius:28px!important;
  border-top-right-radius:28px!important;
  overflow:visible!important;
  box-shadow:0 -6px 30px rgba(0,0,0,0.5),0 -2px 0 rgba(0,212,255,0.1)!important;
  transform:translateZ(0)!important;
  -webkit-transform:translateZ(0)!important;
  ```
- `.menu-toolbar .tool-btn` → index.html (style tag #1):8
  ```css
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:4px!important;
  padding:8px 3px!important;
  flex:1!important;
  max-width:100px!important;
  min-height:60px!important;
  border:none!important;
  border-radius:16px!important;
  background:transparent!important;
  color:rgba(255,255,255,0.55)!important;
  cursor:pointer;
  position:relative!important;
  transition:all 0.3s cubic-bezier(0.23,1,0.32,1)!important;
  ```
- `.menu-toolbar .tool-btn .icon` → index.html (style tag #1):9
  ```css
  font-size:28px!important;
  line-height:1!important;
  transition:all 0.3s ease!important;
  filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))!important;
  ```
- `.menu-toolbar .tool-btn .label` → index.html (style tag #1):10
  ```css
  font-size:12px!important;
  font-weight:600!important;
  letter-spacing:0.5px!important;
  color:inherit!important;
  line-height:1!important;
  ```
- `.menu-toolbar .tool-btn::after` → index.html (style tag #1):11
  ```css
  content:''!important;
  position:absolute!important;
  bottom:4px!important;
  left:50%!important;
  transform:translateX(-50%)!important;
  width:0!important;
  height:4px!important;
  border-radius:3px!important;
  background:#00D4FF!important;
  transition:all 0.35s ease!important;
  box-shadow:0 0 12px rgba(0,212,255,0.8)!important;
  ```
- `.menu-toolbar .tool-btn:hover` → index.html (style tag #1):12
  ```css
  background:rgba(255,255,255,0.06)!important;
  color:rgba(255,255,255,0.8)!important;
  transform:translateY(-2px)!important;
  ```
- `.menu-toolbar .tool-btn.active` → index.html (style tag #1):13
  ```css
  color:#00D4FF!important;
  background:rgba(0,212,255,0.12)!important;
  box-shadow:0 0 20px rgba(0,212,255,0.15)!important;
  ```
- `.menu-toolbar .tool-btn.active .icon` → index.html (style tag #1):14
  ```css
  filter:drop-shadow(0 0 16px rgba(0,212,255,0.8))!important;
  transform:translateY(-3px) scale(1.2)!important;
  ```
- `.menu-toolbar .tool-btn.active .label` → index.html (style tag #1):15
  ```css
  color:#00D4FF!important;
  font-weight:700!important;
  letter-spacing:0.6px!important;
  ```
- `.menu-toolbar .tool-btn.active::after` → index.html (style tag #1):16
  ```css
  width:28px!important;
  ```

## 重复 @keyframes 列表

- `ai-fab-pulse` → all-styles.css, ai-float.css (2处)
- `ai-fab-badge-pulse` → all-styles.css, ai-float.css (2处)
- `ai-panel-slide-in` → all-styles.css, ai-float.css (2处)
- `ai-msg-fade-in` → all-styles.css, ai-float.css (2处)
- `cardFadeIn` → all-styles.css, transitions.css, ai-tutor.css (4处)
- `pulse-ring` → all-styles.css, ai-tutor.css (2处)
- `dotPulse` → all-styles.css, ai-tutor.css (2处)
- `msgFadeIn` → all-styles.css, ai-tutor.css (2处)
- `typingBounce` → all-styles.css, ai-tutor.css (2处)
- `bgShift` → all-styles.css, bg-premium.css (2处)
- `orbFloat1` → all-styles.css, bg-premium.css (2处)
- `orbFloat2` → all-styles.css, bg-premium.css (2处)
- `orbFloat3` → all-styles.css, bg-premium.css (2处)
- `orbFloat4` → all-styles.css, bg-premium.css (2处)
- `topBarPulse` → all-styles.css, bg-premium.css (2处)
- `menuSpotlight` → all-styles.css, bg-premium.css (2处)
- `starTwinkle` → all-styles.css, bg-themes.css (2处)
- `meteorFall1` → all-styles.css, bg-themes.css (2处)
- `meteorFall2` → all-styles.css, bg-themes.css (2处)
- `meteorFall3` → all-styles.css, bg-themes.css (2处)
- `auroraWave` → all-styles.css, bg-themes.css (2处)
- `matrixFall` → all-styles.css, bg-themes.css (2处)
- `certShine` → all-styles.css, cert-enhance.css (2处)
- `certModalIn` → all-styles.css, cert-enhance.css (2处)
- `certCardFadeIn` → all-styles.css, certification.css (2处)
- `badgePulse` → all-styles.css, menu-enhance.css, certification.css (4处)
- `modalFadeIn` → all-styles.css, certification.css (2处)
- `pulse-glow` → clean-ui.css, all-styles.css (2处)
- `neonPulse` → clean-ui.css, all-styles.css (2处)
- `glassShimmer` → clean-ui.css, all-styles.css (2处)
- `float3D` → clean-ui.css, all-styles.css (2处)
- `cardSlideIn` → clean-ui.css, all-styles.css (2处)
- `simFadeIn` → all-styles.css, disaster-sim.css (2处)
- `phasePulse` → all-styles.css, disaster-sim.css (2处)
- `resultSlideIn` → all-styles.css, disaster-sim.css (2处)
- `dustRise1` → all-styles.css, fx-effects.css (2处)
- `dustRise2` → all-styles.css, fx-effects.css (2处)
- `dustRise3` → all-styles.css, fx-effects.css (2处)
- `dustRise4` → all-styles.css, fx-effects.css (2处)
- `dustRise5` → all-styles.css, fx-effects.css (2处)
- `dustRise6` → all-styles.css, fx-effects.css (2处)
- `dustRise7` → all-styles.css, fx-effects.css (2处)
- `dustRise8` → all-styles.css, fx-effects.css (2处)
- `sweep` → all-styles.css, fx-effects.css (2处)
- `geoSpin` → all-styles.css, fx-effects.css (2处)
- `pulseExpand` → all-styles.css, fx-effects.css (2处)
- `meteorFall` → all-styles.css, fx-effects.css (2处)
- `barFlow1` → all-styles.css, fx-effects.css (2处)
- `barFlow2` → all-styles.css, fx-effects.css (2处)
- `barFlow3` → all-styles.css, fx-effects.css (2处)
- `streamFall` → all-styles.css, fx-effects.css (2处)
- `guideFadeIn` → all-styles.css, guide-enhance.css (2处)
- `guidePulse` → all-styles.css, guide-enhance.css (2处)
- `guideTooltipIn` → all-styles.css, guide-enhance.css (2处)
- `loadingFadeIn` → all-styles.css, loading.css (2处)
- `loadingFadeOut` → all-styles.css, loading.css (2处)
- `loadingLogoEnter` → all-styles.css, loading.css (2处)
- `loadingIconPulse` → all-styles.css, loading.css (2处)
- `loadingParticleFloat` → all-styles.css, loading.css (2处)
- `loadingGlow` → all-styles.css, loading.css (2处)
- `rcFadeIn` → real-cases.css, all-styles.css (2处)
- `rcSlideIn` → real-cases.css, all-styles.css (2处)
- `settingsIconFloat` → all-styles.css, settings.css (2处)
- `settingsFadeIn` → all-styles.css, settings.css (2处)
- `shareOverlayIn` → all-styles.css, share.css (2处)
- `shareModalIn` → all-styles.css, share.css (2处)
- `menuItemSlideIn` → all-styles.css, transitions.css (2处)
- `headerSlideDown` → all-styles.css, transitions.css (2处)
- `optionFadeIn` → all-styles.css, transitions.css (2处)
- `loadingPulse` → all-styles.css, transitions.css (2处)
- `successBounce` → all-styles.css, transitions.css (2处)
- `errorShake` → all-styles.css, transitions.css (2处)
- `fadeInUp` → all-styles.css, ui-ultimate.css (2处)
- `wrongShake3D` → v5-glass-3d.css, all-styles.css (2处)
- `card3DGlassIn` → v5-glass-3d.css, all-styles.css (2处)
- `icon3DGlassFloat` → v5-glass-3d.css, all-styles.css (2处)
- `exp3DGlassIn` → v5-glass-3d.css, all-styles.css (2处)
- `streakPulse` → v5-glass-3d.css, all-styles.css (2处)
- `combo3DGlassExplode` → v5-glass-3d.css, all-styles.css (2处)
- `feedback3DGlassIn` → v5-glass-3d.css, all-styles.css (2处)
- `result3DGlassIn` → v5-glass-3d.css, all-styles.css (2处)
- `logo3DGlassGlow` → v5-glass-3d.css, all-styles.css (2处)
- `menuLogoFloat` → v5-glass-3d.css, all-styles.css (2处)
- `gradientShift` → v5-glass-3d.css, all-styles.css (2处)
- `resultPop3D` → v5-glass-3d.css, all-styles.css (2处)
- `versionPulse` → v5-glass-3d.css, all-styles.css (2处)
