import { Card } from "react-bootstrap";
import CodeToTextParser from "./codeToTextParser";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ViewHeader } from "@/ui/shared";

const Datenschutz: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lines = Array.from({ length: 34 }, (_, i) =>
    t(`privacy.line_${i + 1}`)
  );
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
        <ViewHeader title={t("settings_Datenschutz")} onBack={onBack} />
        <div className="after-login-container">
          <Card className="mb-3 margin2vw">
            <Card.Header as="h2">Infos</Card.Header>
            <Card.Body>
              {lines.map((line, index) => (
                <CodeToTextParser key={index} code={line} />
              ))}
              <a href="https://policies.google.com/privacy">
                Google: https://policies.google.com/privacy
              </a>
              <br />
              <br />
              <br />
              <br />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;
