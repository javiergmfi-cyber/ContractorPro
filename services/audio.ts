import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Audio recording permission not granted");
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
  } catch (error) {
    console.error("Failed to start recording:", error);
    throw error;
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    recording = null;

    return uri;
  } catch (error) {
    console.error("Failed to stop recording:", error);
    recording = null;
    throw error;
  }
}

export async function playAudio(uri: string): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  } catch (error) {
    console.error("Failed to play audio:", error);
    throw error;
  }
}
