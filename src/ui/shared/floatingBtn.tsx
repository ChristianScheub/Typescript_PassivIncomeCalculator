import React, { CSSProperties } from "react";
import { IconType } from "react-icons";
import { Fab } from "@mui/material";
import { styled } from "@mui/material/styles";


export enum ButtonAlignment {
  LEFT = "LEFT",
  CENTER = "CENTER",
  RIGHT = "RIGHT",
}

interface FloatingBtnProps {
  alignment: ButtonAlignment;
  icon: IconType | React.ComponentType<Record<string, unknown>>;
  onClick: () => void;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  disabled?: boolean;
}

const FloatingBtn: React.FC<FloatingBtnProps> = ({ 
  alignment, 
  icon, 
  onClick, 
  backgroundColor = '#9AB899',
  hoverBackgroundColor = '#8BA88A',
  disabled = false
}) => {
  const IconComponent = icon;

  const StyledFabWithCustomColors = styled(Fab)(() => ({
    width: '64px',
    height: '64px',
    backgroundColor: backgroundColor,
    color: 'white',
    '&:hover': {
      backgroundColor: hoverBackgroundColor,
    },
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  }));

  let positionStyle: CSSProperties;

  switch (alignment) {
    case ButtonAlignment.LEFT:
      positionStyle = {
        position: "fixed",
        bottom: "1vw",
        left: "0rem",
        transform: "translate(50%, -50%)",
        zIndex: 100,
      };
      break;
    case ButtonAlignment.CENTER:
      positionStyle = {
        position: "fixed",
        bottom: "10vw",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
      };
      break;
    case ButtonAlignment.RIGHT:
      positionStyle = {
        position: "fixed",
        bottom: "10vw",
        right: "0rem",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
      };
      break;
  }

  return (
    <div style={positionStyle} data-testid="floating-btnDiv">
      <StyledFabWithCustomColors
        onClick={onClick}
        disabled={disabled}
        data-testid="floating-btn" 
      >
        <IconComponent size={35} />
      </StyledFabWithCustomColors>
    </div>
  );
};

export default FloatingBtn;