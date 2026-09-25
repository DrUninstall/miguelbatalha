"""Fold audio past the loop point back onto the start and write sfx.wav."""
import json, wave
import numpy as np

SR, T = 48000, 23
d = json.load(open("audio-raw.json"))
x = np.stack([np.array(d["L"]), np.array(d["R"])], 1)
y = x[: T * SR].copy()
tail = x[T * SR :]
y[: len(tail)] += tail  # tails ringing past the loop point continue at its start
y = y / np.abs(y).max() * 0.89  # about -1 dBFS
w = wave.open("sfx.wav", "wb")
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((y * 32767).astype("<i2").tobytes()); w.close()
