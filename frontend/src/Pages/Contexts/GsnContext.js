import React, { createContext, useState } from 'react';

export const SelectedValueContext = createContext();

export const SelectedValueProvider = ({ children }) => {
    const [selectedValue, setSelectedValue] = useState(null);

    return (
        <SelectedValueContext.Provider value={{ selectedValue, setSelectedValue }}>
            {children}
        </SelectedValueContext.Provider>
    );
};
