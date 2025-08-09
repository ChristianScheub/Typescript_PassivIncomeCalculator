import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../portfolioHub/dialog/Modal";
import { Card, CardContent, CardFooter, CardTitle } from "./Card";
import { Button } from "../shared";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-lg mx-auto">
        <CardContent>
          <br />
          <CardTitle>{title}</CardTitle>
          <br />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <span className="flex-1" />
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t("common.remove")}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
};
