import { ConfigProvider, Flex } from "antd"

const NoItems = () => {
    return (
        <ConfigProvider renderEmpty={undefined}>
            <Flex align='center' justify='center' vertical style={{ height: "56vh" }}>
                <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 60 60" className='' style={{ width: "60px", height: "60px" }}>
                    <path d="M59.79 35.299l.02-.012-14.9-15.2a1.247 1.247 0 00-1.06-.587h-27.7c-.432 0-.832.222-1.06.587l-14.9 15.2.02.012c-.122.192-.21.407-.21.651V54.7c0 2.758 2.244 5 5 5h50c2.756 0 5-2.242 5-5V35.95c0-.244-.088-.459-.21-.651zM16.844 22h26.314l13.338 12.7H47.5c-2.756 0-5 2.242-5 5 0 1.378-1.12 2.5-2.5 2.5H20c-1.38 0-2.5-1.122-2.5-2.5 0-2.758-2.244-5-5-5H3.505L16.843 22zM57.5 54.7c0 1.378-1.12 2.5-2.5 2.5H5c-1.38 0-2.5-1.122-2.5-2.5V37.2h10c1.38 0 2.5 1.122 2.5 2.5 0 2.758 2.244 5 5 5h20c2.756 0 5-2.242 5-5 0-1.378 1.12-2.5 2.5-2.5h10v17.5z" fill="#9199ad"></path>
                    <path d="M24 39.6c2.4-1.2 31.249-1.081 8.4-31.2-13.2-17.4-30.032 9-7.8 9 2.4 0 6.4 3.4 22.8-5.4" fill="none" stroke="#9199ad" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 3"></path>
                    <g clipPath="url(#clip0)" fill="#00a89f">
                        <path d="M56.955 6.478c-.39-.969-4.356-1.607-5.452-.031a2.175 2.175 0 00-.379 1.611c-.43.119-.85.398-1.193.859-1.016 1.43 1.374 4.123 2.198 3.936.544-.123 1.175-1.513 1.217-2.752 1.837-.03 3.95-2.776 3.61-3.623zM49.723 7.25a2.178 2.178 0 001.206-1.135c.817-1.737-1.719-4.852-2.753-4.706-.904.128-2.225 3.331-1.333 4.937-1.052.656-1.94 1.897-1.775 2.43.25.807 3.778 1.53 4.508-.065.228-.527.259-1.03.147-1.462z"></path>
                    </g>
                    <defs>
                        <clipPath id="clip0">
                            <path fill="#ffffff" transform="rotate(30 24.304 90.702)" d="M0 0h10.8v10.8H0z"></path>
                        </clipPath>
                    </defs>
                </svg>
                <span>There are no items to show.</span>
            </Flex>
        </ConfigProvider>
    )
}

export default NoItems