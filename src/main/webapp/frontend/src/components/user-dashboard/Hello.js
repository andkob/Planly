import React, { useEffect, useState } from "react";
import { fetchUserFirstName } from "../../util/EndpointManager";

export default function Hello() {
    const [keyword, setKeyword] = useState('morn- wait who are you?'); // default msg idk
    const [name, setName] = useState('');

    useEffect(() => {
        const tod = new Date().getHours();
        if (tod.valueOf() < 12) {
            setKeyword('Morning');
        } else if (tod.valueOf() < 18) {
            setKeyword('Afternoon');
        } else if (tod.valueOf() < 24) {
            setKeyword('Evening');
        }

        fetchUserFirstName(setName);
    }, []);

    if (keyword && name) {
        return ( <span className="ml-2 text-xl font-semibold">Good {keyword}, {name}</span> );
    }

    return (<></>);
}