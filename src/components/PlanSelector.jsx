import React from 'react';
import { useData } from '../context/DataContext.jsx';
import './PlanSelector.css';

const PlanSelector = ({ selectedPlanIds, onToggle }) => {
    const { plans, billingFrequency } = useData();

    return (
        <div className="plan-selector-grid">
            {plans.map((plan) => {
                const isSelected = selectedPlanIds.includes(plan.id);
                const priceDisplay = billingFrequency === 'monthly' ? plan.price : plan.priceAnnual;
                const inrDisplay = billingFrequency === 'monthly' ? plan.priceINR : plan.priceAnnualINR;

                return (
                    <button
                        key={plan.id}
                        onClick={() => onToggle(plan.id)}
                        className={`plan-card ${isSelected ? 'selected' : ''}`}
                    >
                        <div
                            className={`status-dot ${isSelected ? 'active' : ''}`}
                            style={!isSelected ? { backgroundColor: plan.color } : {}}
                        />
                        <span className="plan-card-name">{plan.name}</span>
                        <div className="plan-card-pricing">
                            <span className={`plan-price ${isSelected ? 'selected' : ''}`}>{priceDisplay}</span>
                            <span className={`plan-price-inr ${isSelected ? 'selected' : ''}`}>{inrDisplay}</span>
                        </div>
                        {plan.type === 'Add-on' && (
                            <span className={`addon-badge ${isSelected ? 'selected' : ''}`}>Add-on</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default PlanSelector;
