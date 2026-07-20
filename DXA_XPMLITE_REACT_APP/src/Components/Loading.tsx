interface LoadingProps {
    status?: string
}

const loadingStyle: React.CSSProperties = {
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "100%", 
    textTransform: "capitalize"
};

const Loading = ({ status }: LoadingProps) => {
    return (
        <div className="position-absolute w-100 h-100 bg-dark">
            <div className="page-loader">
                <div className="loader">Loading...</div>
                {status ? <p style={loadingStyle}></p> : null}
            </div>
        </div>
    )
}

export default Loading;
