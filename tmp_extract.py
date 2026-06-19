import re, sys, json

path = 'C:/Users/hambu/Documents/kimi/workspace/yingji-xiaodaren/game.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

def extract_engine(text, name):
    idx = text.find(name + '={')
    if idx == -1:
        idx = text.find(name + ' = {')
    if idx == -1:
        return None
    start = text.find('{', idx)
    if start == -1:
        return None
    depth = 1
    i = start + 1
    while i < len(text) and depth > 0:
        c = text[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
        elif c == '"':
            j = i + 1
            while j < len(text):
                if text[j] == '\\':
                    j += 2
                elif text[j] == '"':
                    break
                else:
                    j += 1
            i = j
        elif c == "'":
            j = i + 1
            while j < len(text):
                if text[j] == '\\':
                    j += 2
                elif text[j] == "'":
                    break
                else:
                    j += 1
            i = j
        elif c == '`':
            j = i + 1
            while j < len(text):
                if text[j] == '\\':
                    j += 2
                elif text[j] == '`':
                    break
                else:
                    j += 1
            i = j
        i += 1
    return text[start:i]

engines = ['FirstAidEngine', 'KitEngine', 'ScenarioEngine', 'QuizEngine', 'BattleEngine',
           'StudyEngine', 'BlindBoxEngine', 'CheckinEngine', 'PKEngine', 'SurvivalEngine',
           'BossRushEngine', 'TimedChallengeEngine', 'DailyChallengeEngine', 'StoryEngine',
           'DisasterQuizGame', 'SupplyDropGame', 'TimeEscapeEngine', 'PrecisionEngine',
           'StoryAdventureEngine', 'MemoryCardEngine', 'ReactionEngine', 'KnowledgeRaceEngine',
           'GuideEngine', 'TimedEscapeEngine', 'PrecisionStrikeEngine', 'StoryChallengeEngine',
           'EggEngine', 'EncyclopediaEngine', 'CodexEngine', 'AchievementEngine', 'StatsEngine',
           'ShopEngine', 'LeaderboardEngine', 'CharacterEngine', 'MiniGameEngine',
           'CalendarEngine', 'SettingsEngine', 'PetEngine', 'OutfitEngine', 'BaseEngine',
           'UniversalSystemViewer', 'CardFragmentEngine', 'SetBonusEngine',
           'GachaEngine', 'MusicEngine', 'EasterEggEngine', 'DisasterMuseumEngine',
           'DiaryEngine', 'CardSynthesisEngine', 'CardUpgradeEngine', 'RouletteEngine',
           'ScratchEngine', 'DailyTaskEngine', 'SeasonEngine', 'ComboEngine',
           'CoinRainEngine', 'CardDropEngine', 'MascotEngine', 'JuiceEngine',
           'I18nEngine', 'ThemeEngine', 'TransitionEngine', 'LevelEngine',
           'AmbientParticles', 'AudioManager', 'BGMEngine', 'VisualFX',
           'PageManager', 'Modal', 'GameState']

results = {}
for name in engines:
    code = extract_engine(text, name)
    if code:
        results[name] = {'len': len(code), 'code': code}

with open('C:/Users/hambu/Documents/kimi/workspace/yingji-xiaodaren/engine_audit.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print('Done, wrote', len(results), 'engines')
