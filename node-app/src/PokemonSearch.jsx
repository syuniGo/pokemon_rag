import React, { useState, useCallback, useEffect } from 'react';
import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import "/src/tw.css";
/**
 * @typedef {Object} Pokemon
 * @property {number} id
 * @property {string} name
 * @property {boolean} [isRelevant]
 */

/**
 * @typedef {Object} SearchResponse
 * @property {Array<{number: number, nameCn: string}>} search_results
 * @property {string} answer
 * @property {string} relevance
 * @property {string} relevance_explanation
 */

export default function PokemonSearch() {
  const [search, setSearch] = useState('');
  const [pokemonList, setPokemonList] = useState([]);
  const [displayList, setDisplayList] = useState([]); // 新增：当前显示的3个宝可梦
  const [searchResponse, setSearchResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState(0);

  // 更新显示列表
  const updateDisplayList = useCallback((newIndex) => {
    const listLength = pokemonList.length;
    const displayItems = [];

    for (let i = 0; i < 3; i++) {
      const index = (newIndex + i) % listLength;
      displayItems.push({
        ...pokemonList[index],
        displayIndex: i // 添加显示位置索引
      });
    }

    setDisplayList(displayItems);
  }, [pokemonList]);

  // 初始化和数据更新时设置显示列表
  useEffect(() => {
    if (pokemonList.length > 0) {
      updateDisplayList(0);
      setCurrentIndex(0);
      setSelectedPokemonIndex(0);
    }
  }, [pokemonList, updateDisplayList]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8084/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: search, top_k: 5 }),
      });
      const data = await response.json();
      setSearchResponse(data);
      // 修改：结合search_results和pokemon_entries创建新的pokemonList
      if (data?.search_results && data?.pokemon_entries) {
        const mostRelevantNo = data.summary?.most_relevant_pokemon?.no;
        const newPokemonList = data.search_results.map(pokemon => {
          const entry = data.pokemon_entries.find(entry => entry.no === pokemon.no);
          return {
            id: pokemon.no,
            name: pokemon.nameCn,
            isRelevant: pokemon.no === mostRelevantNo, // 根据most_relevant_pokemon设置推荐
            // 添加pokemon_entries的信息
            powerRating: entry?.power_rating || 'N/A',
            relevanceScore: entry?.relevance_score || 0,
            relevanceAnalysis: entry?.relevance_analysis || '',
            backgroundStory: entry?.background_story || ''
          };
        });
        setPokemonList(newPokemonList);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % pokemonList.length;
    setCurrentIndex(nextIndex);
    updateDisplayList(nextIndex);
    setSelectedPokemonIndex(0); // 重置选中项到第一个
  }, [currentIndex, pokemonList.length, updateDisplayList]);

  const handlePrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + pokemonList.length) % pokemonList.length;
    setCurrentIndex(prevIndex);
    updateDisplayList(prevIndex);
    setSelectedPokemonIndex(0); // 重置选中项到第一个
  }, [currentIndex, pokemonList.length, updateDisplayList]);

  const handleClearSearch = () => {
    setSearch('');
    setPokemonList([]);
    setDisplayList([]);
    setSearchResponse(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1f36]">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          探索宝可梦的世界
        </h1>

        {/* Search Bar */}
        <div className="relative w-full max-w-md mx-auto mb-12">
          <div className="relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2a2f45] border-[#3a3f55] text-white placeholder:text-gray-400 pr-20"
              placeholder="搜索宝可梦..."
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              onClick={handleSearch}
              disabled={isLoading || !search.trim()}
              className="absolute right-0 top-0 h-full bg-[#4c4dff] hover:bg-[#3a3bff]"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "搜索"}
            </Button>
          </div>
        </div>

        {displayList.length > 0 && (
          <div className="mb-8">
            <div className="relative flex items-center justify-center gap-4">
              <Button
                onClick={handlePrev}
                variant="ghost"
                className="bg-[#2a2f45] hover:bg-[#3a3f55] text-white rounded-full p-2 z-20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex justify-center items-center gap-4">
                {displayList.map((pokemon, index) => (
                  <div
                    key={`${pokemon.id}-${pokemon.displayIndex}`}
                    onClick={() => setSelectedPokemonIndex(index)}
                    className={`transform transition-all duration-300 cursor-pointer ${index === 1  
                      ? 'scale-125 z-10'
                      : ''
                      }`}
                  >
                    <div className={`bg-[#2a2f45] rounded-lg p-4 ${pokemon.isRelevant
                      ? 'ring-2 ring-[#FFD700] bg-[#313866]'
                      : ''
                      } ${index === 1
                        ? 'bg-[#3a3f55] shadow-xl shadow-[#4c4dff]/20'
                        : 'hover:bg-[#3a3f55]'
                      }`}>
                      <div className={`w-full aspect-square rounded-lg p-2 mb-2 ${pokemon.isRelevant
                        ? 'bg-[#232655]' // 保留推荐项的图片背景色
                        : 'bg-[#1a1f36]'
                        }`}>
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center p-4">
                        <p className={`font-medium truncate ${pokemon.isRelevant
                          ? 'text-[#FFD700]'  // 保留推荐项的金色文字
                          : 'text-white'
                          }`}>
                          {pokemon.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          #{String(pokemon.id).padStart(3, '0')}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-300">
                            实力评级: {pokemon.powerRating}
                          </p>
                          <p className="text-xs text-gray-300">
                            相关度: {pokemon.relevanceScore}
                          </p>
                        </div>
                        {pokemon.isRelevant && (
                          <span className="absolute inline-block mt-1 px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] text-xs rounded-full">
                            推荐
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleNext}
                variant="ghost"
                className="bg-[#2a2f45] hover:bg-[#3a3f55] text-white rounded-full p-2 z-20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Pokemon Details */}
        {displayList.length > 0 && searchResponse?.search_results[currentIndex] && (
          <div className="mt-4 bg-[#2a2f45] rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* 左侧：基本信息 */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">名称</h3>
                  <p className="text-white text-sm">中：{searchResponse.search_results[currentIndex].nameCn}</p>
                  <p className="text-white text-sm">英：{searchResponse.search_results[currentIndex].nameEn}</p>
                  <p className="text-white text-sm">日：{searchResponse.search_results[currentIndex].nameJa}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">属性</h3>
                  <div className="flex flex-wrap gap-1">
                    {searchResponse.search_results[currentIndex].types.map((type, index) => (
                      <span key={index} className="px-2 py-0.5 bg-[#3a3f55] rounded-full text-white text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 中间：能力值 */}
              <div className="col-span-2">
                <h3 className="text-sm text-gray-400 mb-1">能力值</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(searchResponse.search_results[currentIndex].stats).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-gray-300 text-xs w-8">
                        {key === 'hp' ? 'HP' :
                          key === 'attack' ? '攻击' :
                            key === 'defense' ? '防御' :
                              key === 'specialAttack' ? '特攻' :
                                key === 'specialDefense' ? '特防' :
                                  '速度'}
                      </span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 bg-[#1a1f36] rounded-full h-1.5">
                          <div
                            className="bg-[#4c4dff] h-1.5 rounded-full"
                            style={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-white text-xs w-6">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 底部：特性和描述 */}
            <div className="mt-3 space-y-2">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">特性</h3>
                <div className="flex flex-wrap gap-1">
                  {searchResponse.search_results[currentIndex].abilities.map((ability, index) => (
                    <span key={index} className="px-2 py-0.5 bg-[#3a3f55] rounded-full text-white text-xs">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">描述</h3>
                <p className="text-white text-sm">{searchResponse.search_results[currentIndex].description}</p>
              </div>
              <div className="mt-4 border-t border-[#3a3f55] pt-4">
                <h3 className="text-sm text-gray-400 mb-2">额外信息</h3>
                <p className="text-white text-sm mb-2">
                  相关性分析: {displayList[selectedPokemonIndex]?.relevanceAnalysis}
                </p>
                <p className="text-white text-sm">
                  背景故事: {displayList[selectedPokemonIndex]?.backgroundStory}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* AI Response */}
        {searchResponse && (
          <div className="space-y-4 mt-8">
            <div className="bg-[#2a2f45] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">AI 回答</h2>
              <p className="text-gray-300 leading-relaxed">
                {searchResponse.answer}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2a2f45] rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">相关度</h3>
                <p className="text-gray-300">
                  {searchResponse.relevance}
                </p>
              </div>
              <div className="bg-[#2a2f45] rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">解释</h3>
                <p className="text-gray-300">
                  {searchResponse.relevance_explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}