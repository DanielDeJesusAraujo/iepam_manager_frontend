'use client';

import { Box, Heading, Text, Flex, useColorMode } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightElement?: ReactNode;
}

export function PageHeader({ title, description, rightElement }: PageHeaderProps) {
  const { colorMode } = useColorMode();

  return (
    <Flex
      justify="space-between"
      align="center"
      mb={6}
    >
      <Box>
        <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
          {title}
        </Heading>
        {description && (
          <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} mt={1}>
            {description}
          </Text>
        )}
      </Box>
      {rightElement && (
        <Box>
          {rightElement}
        </Box>
      )}
    </Flex>
  );
} 