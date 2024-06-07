import { Appearance } from 'react-native';
import { useState, useEffect } from 'react';


export function useColorScheme() {
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const currentScheme = (preferences: Appearance.AppearancePreferences) => {
            setColorScheme(preferences.colorScheme);
        }
        const changeScheme = Appearance.addChangeListener(currentScheme);

        return () => {changeScheme.remove()};

    }, []);

    return colorScheme;
}