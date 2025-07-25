import React from "react";

export default function ProgressSteps({ currentStep }) {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
            {[
            { id: 'shipping', label: 'Shipping', number: 1 },
            { id: 'payment', label: 'Payment', number: 2 },
            { id: 'review', label: 'Review', number: 3 }
            ].map((step, index) => (
            <React.Fragment key={step.id}>
                <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id 
                    ? 'bg-rose-500 text-white' 
                    : index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                        ? 'bg-rose-200 text-rose-700'
                        : 'bg-gray-200 text-gray-500'
                }`}>
                    {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                    currentStep === step.id ? 'text-rose-600' : 'text-gray-500'
                }`}>
                    {step.label}
                </span>
                </div>
                {index < 2 && (
                <div className={`w-8 h-0.5 ${
                    index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'bg-rose-200'
                    : 'bg-gray-200'
                }`} />
                )}
            </React.Fragment>
            ))}
        </div>
      </div>
    );
}