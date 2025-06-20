import * as React from "react"
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react"

interface ButtonProps extends ChakraButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "default", size = "default", ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "destructive":
          return {
            bg: "red.500",
            color: "white",
            _hover: { bg: "red.600" },
          }
        case "outline":
          return {
            bg: "transparent",
            border: "1px solid",
            borderColor: "gray.200",
            _hover: { bg: "gray.100" },
          }
        case "secondary":
          return {
            bg: "gray.100",
            color: "gray.900",
            _hover: { bg: "gray.200" },
          }
        case "ghost":
          return {
            bg: "transparent",
            _hover: { bg: "gray.100" },
          }
        case "link":
          return {
            bg: "transparent",
            color: "blue.500",
            _hover: { textDecoration: "underline" },
          }
        default:
          return {
            bg: "blue.500",
            color: "white",
            _hover: { bg: "blue.600" },
          }
      }
    }

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return { px: 3, h: 8, fontSize: "sm" }
        case "lg":
          return { px: 8, h: 12, fontSize: "lg" }
        case "icon":
          return { w: 8, h: 8 }
        default:
          return { px: 4, h: 10 }
      }
    }

    return (
      <ChakraButton
        ref={ref}
        {...getVariantStyles()}
        {...getSizeStyles()}
        {...props}
      >
        {children}
      </ChakraButton>
    )
  }
)
Button.displayName = "Button"

export { Button } 