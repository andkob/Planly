import React, { useEffect, useState } from "react";
import CallServer from "../../util/CallServer";

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

        CallServer('/api/users/me/first-name', 'GET')
        .then((response) =>  {
            if (!response.ok) {
                throw new Error("Failed to fetch user name");
            }
            return response.text();
        })
        .then((firstName) => {
            setName(firstName);
        })
        .catch((error) => {
            console.error("Error fetching user first name:", error);
        });

    }, []);

    if (keyword && name) {
        return ( <span className="ml-2 text-xl font-semibold">Good {keyword}, {name}</span> );
    }

    return (<></>);
}