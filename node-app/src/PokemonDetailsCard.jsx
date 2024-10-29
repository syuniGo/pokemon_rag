import React from 'react';

const PokemonDetailsCard = ({ pokemon }) => {
    return (
        <div className="rounded-lg border bg-[#2a2f45] text-white border-[#3a3f55] shadow-sm">
            <div className="p-6">
                {/* 名称部分 */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{pokemon.name?.cn}</h2>
                            <div className="flex gap-2 text-sm text-gray-400">
                                <span>{pokemon.name?.en}</span>
                                <span>•</span>
                                <span>{pokemon.name?.ja}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-semibold">#{String(pokemon.id).padStart(3, '0')}</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#3a3f55] my-4" />

                {/* 属性和特性部分 */}
                <div className="grid grid-cols-2 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">属性</h3>
                        <div className="flex gap-2">
                            {pokemon.types?.map((type, index) => (
                                <span key={index} className="px-3 py-1 bg-[#3a3f55] text-white rounded-full text-sm">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">特性</h3>
                        <div className="flex flex-wrap gap-2">
                            {pokemon.abilities?.map((ability, index) => (
                                <span key={index} className="px-3 py-1 bg-[#3a3f55] text-white rounded-full text-sm">
                                    {ability}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 能力值和额外信息并排显示 */}
                <div className="grid grid-cols-2 gap-8">
                    {/* 能力值 - 修改这一列的宽度 */}
                    <div className="space-y-4 w-64" style={{ width: '80%' }}>  {/* 添加 w-64 来控制整列宽度 */}
                        <h3 className="text-lg font-semibold">能力值</h3>
                        <div className="grid gap-3">
                            {Object.entries(pokemon.stats || {}).map(([key, value]) => (
                                <div key={key} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">
                                            {key === 'hp' ? 'HP' :
                                                key === 'attack' ? '攻击' :
                                                    key === 'defense' ? '防御' :
                                                        key === 'specialAttack' ? '特攻' :
                                                            key === 'specialDefense' ? '特防' :
                                                                '速度'}
                                        </span>
                                        <span className="text-white">{value}</span>
                                    </div>
                                    <div className="h-2 bg-[#1a1f36] rounded-full">
                                        <div
                                            className="h-full rounded-full bg-[#4c4dff]"
                                            style={{ width: `${Math.min((value / 255) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 额外信息 */}
                    <div className="space-y-4">
                        {pokemon.relevanceAnalysis && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">相关性分析</h3>
                                <p className="text-gray-300">{pokemon.relevanceAnalysis}</p>
                            </div>
                        )}
                        {pokemon.backgroundStory && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">背景故事</h3>
                                <p className="text-gray-300">{pokemon.backgroundStory}</p>
                            </div>
                        )}
                        {pokemon.relevanceScore && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">相关性</h3>
                                <p className="text-gray-300">{pokemon.relevanceScore}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-[#3a3f55] my-6" />

                {/* 描述 */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">描述</h3>
                    <p className="text-gray-300 leading-relaxed">{pokemon.description}</p>
                </div>
            </div>
        </div>
    );
};

export default PokemonDetailsCard;