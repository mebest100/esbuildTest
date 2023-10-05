import React from 'react'
import { useParams } from "react-router-dom";

const TestPage: React.FC = () => {
    type MatchParams = {
        info: string
    }
     const { info } = useParams<MatchParams>();
    return (
        <div> This is testpage: {info}</div>
    )
}

export default TestPage