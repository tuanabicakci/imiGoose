import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

// AuthGate in _layout.tsx handles all routing.
// This screen only shows briefly as a loading placeholder.
export default function Index() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.imiBackground }}>
            <ActivityIndicator color={Colors.imiPrimary} size="large" />
        </View>
    );
}
