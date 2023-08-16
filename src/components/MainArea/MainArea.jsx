import { Flex, Heading, VStack, Text, IconButton, Icon } from "@chakra-ui/react"
import MapComponent from "./MapComponent"
import { BsGithub } from "react-icons/bs"
import { FaCopyright } from "react-icons/fa"
import Link from "next/link"



export const MainArea = () => {
    return (
        <>
            <Flex flexDir="column">
                <MapComponent />
                <Flex pt="5" px={20} justifyContent="space-around" color="#445069">
                    <Flex flexDir="column">
                        <Heading size="md" width={60}>Simple Interactive Web Map Portfolio</Heading>
                        <Flex alignItems="center" mt={5}>
                            <Icon as={FaCopyright} fontSize={20} variant="outlined" color="#319795" />
                            <Text fontWeight="semibold" ml={1} >Cagri Genctürk</Text>
                        </Flex>
                    </Flex>

                    <VStack alignItems="flex-start">
                        <Heading size="sm">Functionalities</Heading>
                        <Text>1. Filtering points of interest</Text>
                        <Text>2. Navigation from any point to any point of interest</Text>
                        <Flex pt={2} alignItems="center">
                            <Text as="u" >You can find the source code on GitHub:</Text>
                            <Link href="https://github.com/cgrgnc/simple-webmap-manhattan">
                                <IconButton ml={3} icon={<BsGithub />} fontSize={25} color="black" variant="outlined"></IconButton>
                            </Link>
                        </Flex>
                    </VStack>
                </Flex>
            </Flex >
        </>
    )
}