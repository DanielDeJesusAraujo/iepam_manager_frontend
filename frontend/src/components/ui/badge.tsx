import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

interface BadgeProps extends ChakraBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: {
    colorScheme: 'blue',
  },
  success: {
    colorScheme: 'green',
  },
  warning: {
    colorScheme: 'yellow',
  },
  destructive: {
    colorScheme: 'red',
  },
};

export function Badge({ variant = 'default', ...props }: BadgeProps) {
  return <ChakraBadge {...variantStyles[variant]} {...props} />;
} 