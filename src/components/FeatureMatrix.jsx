import React, { useState, useMemo } from 'react';
import { CATEGORY_COLORS } from '../constants.js';
import FeatureDetailsModal from './FeatureDetailsModal.jsx';
import { useData } from '../context/DataContext.jsx';
import './FeatureMatrix.css';

const getCategoryIcon = (cat) => {
    if (cat === 'Productivity') return 'fa-file-alt';
    if (cat === 'Security') return 'fa-shield-alt';
    if (cat === 'Compliance') return 'fa-balance-scale';
    if (cat === 'Management') return 'fa-cog';
    if (cat === 'Voice & Collab') return 'fa-phone-alt';
    if (cat === 'Windows & OS') return 'fa-desktop';
    if (cat === 'Employee Experience') return 'fa-heart';
    return 'fa-cube';
};

const FeatureMatrix = ({ plans }) => {
    const { features } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeFeature, setActiveFeature] = useState(null);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    const categories = [...new Set(features.map((f) => f.category))];
    const allSelectedFeatures = useMemo(() => new Set(plans.flatMap((p) => p.features)), [plans]);

    const getFilteredFeatures = (featuresList) => {
        if (!searchTerm.trim()) return featuresList;
        const term = searchTerm.toLowerCase();
        return featuresList.filter(
            (f) => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term)
        );
    };

    const categoriesToRender = selectedCategory === 'All' ? categories : [selectedCategory];

    const hasAnyMatches = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return features.some((f) => {
            const matchesSearch = !term || f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term);
            const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, features]);

    if (plans.length === 0) {
        return (
            <div className="fm-empty">
                <i className="fas fa-layer-group fm-empty-icon"></i>
                <h3 className="fm-empty-title">No licenses selected</h3>
                <p className="fm-empty-desc">Select one or more licenses above to see the combined feature map.</p>
            </div>
        );
    }

    return (
        <div className="feature-matrix">
            <FeatureDetailsModal feature={activeFeature} onClose={() => setActiveFeature(null)} />

            {/* Filters */}
            <div className="fm-filters glass-morphism">
                <div className="fm-filter-row">
                    <div className="fm-search-wrap">
                        <div className="fm-search-icon"><i className="fas fa-search"></i></div>
                        <input
                            type="text"
                            placeholder="Search capabilities (Security, Teams, DLP)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="fm-search-input"
                        />
                    </div>

                    <div className="fm-dropdown-wrap">
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            className={`fm-category-btn ${selectedCategory !== 'All' ? 'active' : ''}`}
                        >
                            <span>
                                <i className={`fas ${selectedCategory === 'All' ? 'fa-filter' : getCategoryIcon(selectedCategory)}`}></i>
                                {selectedCategory === 'All' ? 'All Modules' : selectedCategory}
                            </span>
                            <i className={`fas fa-chevron-down fm-chevron ${isCategoryDropdownOpen ? 'open' : ''}`}></i>
                        </button>

                        {isCategoryDropdownOpen && (
                            <>
                                <div className="fm-dropdown-backdrop" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                                <div className="fm-dropdown">
                                    <button
                                        onClick={() => { setSelectedCategory('All'); setIsCategoryDropdownOpen(false); }}
                                        className={`fm-dropdown-item ${selectedCategory === 'All' ? 'active-dark' : ''}`}
                                    >
                                        <span>All Modules</span>
                                        {selectedCategory === 'All' && <i className="fas fa-check"></i>}
                                    </button>
                                    <div className="fm-dropdown-divider"></div>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => { setSelectedCategory(cat); setIsCategoryDropdownOpen(false); }}
                                            className={`fm-dropdown-item ${selectedCategory === cat ? 'active-blue' : ''}`}
                                        >
                                            <span>
                                                <i className={`fas ${getCategoryIcon(cat)} fm-dropdown-icon`}></i>
                                                {cat}
                                            </span>
                                            <span className={`fm-count-badge ${selectedCategory === cat ? 'active' : ''}`}>
                                                {features.filter((f) => f.category === cat && allSelectedFeatures.has(f.id)).length}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="fm-meta">
                        <div className="fm-coverage-badge">
                            Active Map Coverage: <span className="fm-coverage-count">{allSelectedFeatures.size} / {features.length}</span>
                        </div>
                        <div className="fm-divider"></div>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                            className="fm-reset-btn"
                        >
                            <i className="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            {!hasAnyMatches && (searchTerm || selectedCategory !== 'All') ? (
                <div className="fm-no-results">
                    <div className="fm-no-results-icon"><i className="fas fa-search-minus"></i></div>
                    <div>
                        <h3 className="fm-no-results-title">No results matched your filter</h3>
                        <p className="fm-no-results-desc">Try adjusting your search terms or module selection.</p>
                    </div>
                    <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="fm-clear-btn">
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="fm-grid">
                    {categoriesToRender.map((cat) => {
                        const catFeatures = features.filter((f) => f.category === cat);
                        const filteredCatFeatures = getFilteredFeatures(catFeatures);
                        const activeFeatures = filteredCatFeatures.filter((f) => allSelectedFeatures.has(f.id));
                        const inactiveFeatures = filteredCatFeatures.filter((f) => !allSelectedFeatures.has(f.id));

                        if (filteredCatFeatures.length === 0) return null;

                        return (
                            <div key={cat} className="category-card">
                                <div className={`category-card-header ${CATEGORY_COLORS[cat] || ''}`}>
                                    <div className="cat-header-left">
                                        <div className="cat-icon-box">
                                            <i className={`fas ${getCategoryIcon(cat)}`}></i>
                                        </div>
                                        {cat}
                                    </div>
                                    <span className="cat-active-count">{activeFeatures.length} Active</span>
                                </div>

                                <div className="cat-features">
                                    {activeFeatures.map((f) => {
                                        const providers = plans.filter((p) => p.features.includes(f.id));
                                        return (
                                            <div key={f.id} className="feature-item" onClick={() => setActiveFeature(f)}>
                                                <div className="feature-item-tooltip">{f.description}</div>
                                                <div className="feature-item-left">
                                                    <div className="feature-icon-box">
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                    <div className="feature-item-text">
                                                        <span className="feature-item-name">{f.name}</span>
                                                        {f.tierComparison && (
                                                            <span className="feature-tiered-badge">Tiered</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="feature-providers">
                                                    {providers.map((p) => (
                                                        <div
                                                            key={p.id}
                                                            className="provider-dot"
                                                            style={{ backgroundColor: p.color }}
                                                            title={p.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {inactiveFeatures.length > 0 && selectedCategory === 'All' && (
                                        <div className="inactive-features">
                                            <div className="inactive-label">Inactive Services</div>
                                            {inactiveFeatures.slice(0, 5).map((f) => (
                                                <div key={f.id} className="inactive-item">
                                                    <div className="inactive-icon"><i className="fas fa-times"></i></div>
                                                    <span className="inactive-name">{f.name}</span>
                                                </div>
                                            ))}
                                            {inactiveFeatures.length > 5 && (
                                                <div className="inactive-more">+ {inactiveFeatures.length - 5} more unavailable</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FeatureMatrix;
