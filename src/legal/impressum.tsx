import { Card } from "react-bootstrap";
import { impressum_text } from "./app_texts";
import CodeToTextParser from "./codeToTextParser";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ViewHeader } from "@/ui/shared";

const Impressum: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onBack = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/settings");
  };

  return (
    <div>
      <div
        style={{
          marginTop: "env(safe-area-inset-top)",
        }}
      >
        <ViewHeader title={t("settings_Impressum")} onBack={onBack} />

        <div className="after-login-container">
          <Card className="mb-3 margin2vw">
            <Card.Header as="h2">Impressum / Legal Notice</Card.Header>
            <Card.Body>
              <CodeToTextParser code={impressum_text} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
