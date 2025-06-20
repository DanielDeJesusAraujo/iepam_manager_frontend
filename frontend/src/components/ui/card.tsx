import * as React from "react"
import { Box, Heading, Text } from "@chakra-ui/react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      rounded="lg"
      borderWidth="1px"
      bg="white"
      shadow="sm"
      {...props}
    >
      {children}
    </Box>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      p={6}
      display="flex"
      flexDirection="column"
      gap={1.5}
      {...props}
    >
      {children}
    </Box>
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Heading
      ref={ref}
      as="h3"
      size="lg"
      fontWeight="semibold"
      lineHeight="none"
      letterSpacing="tight"
      {...props}
    >
      {children}
    </Heading>
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Text
      ref={ref}
      fontSize="sm"
      color="gray.500"
      {...props}
    >
      {children}
    </Text>
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Box ref={ref} p={6} pt={0} {...props}>
      {children}
    </Box>
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, ...props }, ref) => (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      p={6}
      pt={0}
      {...props}
    >
      {children}
    </Box>
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 