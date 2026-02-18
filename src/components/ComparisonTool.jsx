import React, { useState, useMemo } from 'react';
import { CATEGORY_COLORS } from '../constants.js';
import FeatureDetailsModal from './FeatureDetailsModal.jsx';
import { useData } from '../context/DataContext.jsx';
import './ComparisonTool.css';

const ComparisonTool = () => {
    const { features, plans, billingFrequency, selectedPlanIds, setSelectedPlanIds } = useData();
    const [activeFeature, setActiveFeature] = useState(null);
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

    const selectedPlans = useMemo(
        () => plans.filter((p) => selectedPlanIds.includes(p.id)),
        [selectedPlanIds, plans]
    );

    const categories = [...new Set(features.map((f) => f.category))];

    const togglePlan = (id) => {
        setSelectedPlanIds((prev) =>
            prev.includes(id)
                ? prev.length > 1 ? prev.filter((pId) => pId !== id) : prev
                : [...prev, id]
        );
    };

    const exportToCSV = () => {
        const headers = ['Category', 'Feature', 'Description', ...selectedPlans.map((p) => {
            const price = billingFrequency === 'monthly' ? p.price : p.priceAnnual;
            const inr = billingFrequency === 'monthly' ? p.priceINR : p.priceAnnualINR;
            return `${p.name} (${price}/${inr})`;
        })];

        const rows = [];
        categories.forEach((cat) => {
            const catFeatures = features.filter((f) => f.category === cat);
            const filteredFeatures = catFeatures.filter((f) =>
                selectedPlans.some((p) => p.features.includes(f.id))
            );
            filteredFeatures.forEach((f) => {
                const row = [cat, f.name, f.description];
                selectedPlans.forEach((plan) => {
                    const hasFeature = plan.features.includes(f.id);
                    if (!hasFeature) {
                        row.push('No');
                    } else if (f.tierComparison) {
                        const tier = f.tierComparison.tiers.find((t) => t.includedInPlanIds?.includes(plan.id));
                        row.push(tier ? tier.tierName : 'Yes');
                    } else {
                        row.push('Yes');
                    }
                });
                rows.push(row);
            });
        });

        const csvContent = [
            headers.join(','),
            ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `m365_comparison_${billingFrequency}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `minmax(280px, 2fr) repeat(${Math.max(1, selectedPlans.length)}, minmax(150px, 1fr))`,
    };

    return (
        <div className="comparison-tool">
            <FeatureDetailsModal feature={activeFeature} onClose={() => setActiveFeature(null)} />

            {/* Configure Matrix Panel */}
            <div className="ct-config-panel glass-morphism no-print">
                <div className="ct-config-inner">
                    <div className="ct-plan-selector">
                        <h3 className="ct-config-label">
                            <i className="fas fa-layer-group"></i>
                            Configure Matrix ({billingFrequency})
                        </h3>
                        <div className="ct-plan-buttons">
                            {plans.map((p) => {
                                const isSelected = selectedPlanIds.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlan(p.id)}
                                        className={`plan-selection-btn ${isSelected ? 'active' : ''}`}
                                    >
                                        <span
                                            className="plan-dot"
                                            style={{ backgroundColor: isSelected ? '#fff' : p.color }}
                                        ></span>
                                        {p.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ct-actions">
                        <button
                            onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                            className={`ct-diff-btn ${showDifferencesOnly ? 'active' : ''}`}
                        >
                            <i className={`fas ${showDifferencesOnly ? 'fa-filter' : 'fa-list-ul'}`}></i>
                            {showDifferencesOnly ? 'Differences Only' : 'Show All Features'}
                        </button>
                        <div className="ct-export-btns">
                            <button onClick={exportToCSV} className="export-btn csv">
                                <i className="fas fa-file-csv"></i>
                                CSV
                            </button>
                            <button onClick={() => window.print()} className="export-btn pdf">
                                <i className="fas fa-file-pdf"></i>
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="matrix-container">
                <div className="matrix-scroll">
                    <div style={gridStyle}>
                        {/* Header Row */}
                        <div className="matrix-header-cell">
                            <span className="matrix-header-label">Capability Area</span>
                        </div>
                        {selectedPlans.map((plan) => (
                            <div key={plan.id} className="matrix-plan-header">
                                <div className="plan-header-name">{plan.name}</div>
                                <div className="plan-header-price">
                                    {billingFrequency === 'monthly' ? plan.price : plan.priceAnnual}
                                    <span className="plan-header-inr">
                                        {billingFrequency === 'monthly' ? plan.priceINR : plan.priceAnnualINR}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Feature Rows */}
                        {categories.map((cat) => {
                            const catFeatures = features.filter((f) => f.category === cat);
                            let filteredFeatures = catFeatures.filter((f) =>
                                selectedPlans.some((p) => p.features.includes(f.id))
                            );

                            if (showDifferencesOnly && selectedPlans.length > 1) {
                                filteredFeatures = filteredFeatures.filter((f) => {
                                    const statuses = selectedPlans.map((p) => {
                                        if (!p.features.includes(f.id)) return 'none';
                                        if (f.tierComparison) {
                                            const tier = f.tierComparison.tiers.find((t) => t.includedInPlanIds?.includes(p.id));
                                            return tier ? tier.tierName : 'yes';
                                        }
                                        return 'yes';
                                    });
                                    return !statuses.every((s) => s === statuses[0]);
                                });
                            }

                            if (filteredFeatures.length === 0) return null;

                            return (
                                <React.Fragment key={cat}>
                                    <div className={`matrix-category-header ${CATEGORY_COLORS[cat] || ''}`} style={{ gridColumn: '1 / -1' }}>
                                        <span>{cat}</span>
                                    </div>

                                    {filteredFeatures.map((f) => (
                                        <React.Fragment key={f.id}>
                                            <div className="matrix-row-header" onClick={() => setActiveFeature(f)}>
                                                <div className="row-header-name">
                                                    {f.name}
                                                    {f.link && <i className="fas fa-external-link-alt row-link-icon"></i>}
                                                </div>
                                                <p className="row-header-desc">{f.description}</p>
                                            </div>

                                            {selectedPlans.map((plan) => {
                                                const hasFeature = plan.features.includes(f.id);
                                                let content = null;

                                                if (hasFeature) {
                                                    if (f.tierComparison) {
                                                        const tier = f.tierComparison.tiers.find((t) => t.includedInPlanIds?.includes(plan.id));
                                                        content = (
                                                            <div className="cell-tier">
                                                                <div className="cell-check-circle">
                                                                    <i className="fas fa-check"></i>
                                                                </div>
                                                                {tier && <div className="cell-tier-name">{tier.tierName}</div>}
                                                            </div>
                                                        );
                                                    } else {
                                                        content = (
                                                            <div className="cell-check-circle">
                                                                <i className="fas fa-check"></i>
                                                            </div>
                                                        );
                                                    }
                                                }

                                                return (
                                                    <div key={plan.id} className={`matrix-cell ${hasFeature ? 'has-feature' : ''}`}>
                                                        {content}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTool;
