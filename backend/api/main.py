import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FedGuard API",
    description="Privacy-Preserving Federated Learning Platform Compliance and Metrics Backend",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Health Check")
async def health_check():
    return {
        "status": "healthy",
        "service": "FedGuard API",
        "version": "1.0.0"
    }

@app.get("/api/compliance", summary="Get Compliance Mapping")
async def get_compliance_mapping():
    """
    Returns mappings between FedGuard privacy/security components
    and relevant regulatory frameworks: India's DPDP Act 2023 & EU GDPR.
    """
    return {
        "frameworks": ["DPDP Act 2023 (India)", "GDPR (EU)"],
        "compliance_mappings": [
            {
                "id": "comp-1",
                "component": "Differential Privacy (Opacus)",
                "technical_mechanism": "DP-SGD with Gaussian noise calibration and clipping per-sample gradients (ε, δ accounting)",
                "gdpr_mapping": "Article 25: Data Protection by Design and by Default; Recital 26: Anonymous Information",
                "dpdp_mapping": "Section 8(4): Reasonable Security Safeguards; Section 8(5): Data Minimization & Protection",
                "status": "COMPLIANT",
                "risk_mitigation": "Prevents individual client/record reconstruction from aggregated model gradients"
            },
            {
                "id": "comp-2",
                "component": "Zero Raw Data Sharing (Federated Learning)",
                "technical_mechanism": "Flower NumPyClient local training on bank-segregated datasets; only weights leave nodes",
                "gdpr_mapping": "Article 5(1)(c): Data Minimisation; Chapter V (Articles 44-50): Cross-Border Data Transfer Restrictions",
                "dpdp_mapping": "Section 4: Grounds for Processing; Section 16: Cross-border Transfer Restrictions",
                "status": "COMPLIANT",
                "risk_mitigation": "Raw financial transaction records strictly remain in bank perimeter"
            },
            {
                "id": "comp-3",
                "component": "Secure Aggregation (SecAgg / Encryption)",
                "technical_mechanism": "Cryptographic secure multi-party weight aggregation before model updating",
                "gdpr_mapping": "Article 32: Security of Processing (Pseudonymisation and Encryption of Personal Data)",
                "dpdp_mapping": "Section 8(4): Mandatory Technical & Organizational Security Safeguards",
                "status": "COMPLIANT",
                "risk_mitigation": "Server cannot inspect individual bank weight contributions"
            },
            {
                "id": "comp-4",
                "component": "Byzantine Defense (Cosine Similarity Filter)",
                "technical_mechanism": "Server-side gradient vector outlier rejection to detect data/model poisoning attacks",
                "gdpr_mapping": "Article 5(1)(d): Accuracy; Article 32: Availability & Resilience of Processing Systems",
                "dpdp_mapping": "Section 8(3): Accuracy and Completeness of Personal Data",
                "status": "COMPLIANT",
                "risk_mitigation": "Protects global model integrity against adversarial or corrupt client updates"
            },
            {
                "id": "comp-5",
                "component": "Local Explainability (SHAP)",
                "technical_mechanism": "Client-local Tree/Deep SHAP summary generation without transmitting feature spaces",
                "gdpr_mapping": "Article 13(2)(f) & Article 22: Right to Explanation & Protection against Automated Decision-Making",
                "dpdp_mapping": "Section 12: Right to Grievance Redressal & Meaningful Transparency",
                "status": "COMPLIANT",
                "risk_mitigation": "Ensures transparent credit/fraud scoring decisions for bank compliance officers"
            },
            {
                "id": "comp-6",
                "component": "Immutable Audit Log (SQLite)",
                "technical_mechanism": "Append-only cryptographic record of FL rounds, participant IDs, and ε-spent budgets",
                "gdpr_mapping": "Article 5(2): Accountability Principle; Article 30: Records of Processing Activities",
                "dpdp_mapping": "Section 8(6): Accountability and Compliance Logging",
                "status": "COMPLIANT",
                "risk_mitigation": "Provides complete verifiable audit trail for regulatory inspections"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)