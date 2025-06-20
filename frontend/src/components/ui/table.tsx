import * as React from "react"
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableProps as ChakraTableProps,
  HTMLChakraProps
} from "@chakra-ui/react"

const Table = React.forwardRef<HTMLTableElement, ChakraTableProps>(
  ({ children, ...props }, ref) => (
    <ChakraTable ref={ref} {...props}>
      {children}
    </ChakraTable>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, HTMLChakraProps<"thead">>(
  ({ children, ...props }, ref) => (
    <Thead ref={ref} {...props}>
      {children}
    </Thead>
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, HTMLChakraProps<"tbody">>(
  ({ children, ...props }, ref) => (
    <Tbody ref={ref} {...props}>
      {children}
    </Tbody>
  )
)
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<HTMLTableRowElement, HTMLChakraProps<"tr">>(
  ({ children, ...props }, ref) => (
    <Tr ref={ref} {...props}>
      {children}
    </Tr>
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, HTMLChakraProps<"th">>(
  ({ children, ...props }, ref) => (
    <Th ref={ref} {...props}>
      {children}
    </Th>
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, HTMLChakraProps<"td">>(
  ({ children, ...props }, ref) => (
    <Td ref={ref} {...props}>
      {children}
    </Td>
  )
)
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } 