import { Flex, Heading, IconButton } from "@chakra-ui/react"
import { FaMapMarkerAlt } from "react-icons/fa"
export const Header = () => {
    return (
        <Flex h="4em" p={5} justifyContent="center" alignItems="center" bg="#FFF4F4">
            <IconButton fontSize="25" icon={<FaMapMarkerAlt />} variant="outlined" color="#319795" />
            <Heading size="md" color="#319795">Manhattan, New York </Heading>
        </Flex>
    )
}