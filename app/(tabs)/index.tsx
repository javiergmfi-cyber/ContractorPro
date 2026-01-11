import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { VoiceButton } from "../../components/VoiceButton";
import { RecordingOverlay } from "../../components/RecordingOverlay";
import { Card } from "../../components/ui/Card";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { useProfileStore } from "../../store/useProfileStore";
import { formatCurrency } from "../../lib/utils";
import { COLORS } from "../../lib/constants";
import { startRecording, stopRecording } from "../../services/audio";
import { transcribeAudio, parseInvoice } from "../../services/ai";

export default function Dashboard() {
  const router = useRouter();
  const { invoices, setPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const handlePressIn = async () => {
    setIsRecording(true);
    await startRecording();
  };

  const handlePressOut = async () => {
    setIsRecording(false);
    const audioUri = await stopRecording();

    if (audioUri) {
      const transcript = await transcribeAudio(audioUri);
      const parsedInvoice = await parseInvoice(transcript);
      setPendingInvoice(parsedInvoice);
      router.push("/invoice/preview");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-4">
          <Text className="text-3xl font-bold mb-1">
            {profile.businessName || "ContractorPro"}
          </Text>
          <Text className="text-gray-500 mb-8">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <Card className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Total Revenue</Text>
            <Text className="text-4xl font-bold" style={{ color: COLORS.primary }}>
              {formatCurrency(totalRevenue)}
            </Text>
          </Card>

          <View className="flex-row gap-3">
            <Card className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">Pending</Text>
              <Text className="text-2xl font-bold" style={{ color: COLORS.alert }}>
                {formatCurrency(pendingAmount)}
              </Text>
            </Card>
            <Card className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">Invoices</Text>
              <Text className="text-2xl font-bold">{invoices.length}</Text>
            </Card>
          </View>

          <View className="mt-10 items-center">
            <Text className="text-gray-400 text-sm mb-4">
              Hold to create invoice
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-28 left-0 right-0 items-center">
        <VoiceButton
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          isRecording={isRecording}
        />
      </View>

      <RecordingOverlay visible={isRecording} duration={recordingDuration} />
    </SafeAreaView>
  );
}
