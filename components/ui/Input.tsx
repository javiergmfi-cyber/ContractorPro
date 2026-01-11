import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-gray-500 mb-2 font-medium">{label}</Text>
      )}
      <TextInput
        className={`bg-gray-50 rounded-xl px-4 py-4 text-lg ${
          error ? "border border-red-500" : ""
        }`}
        placeholderTextColor="#999999"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
