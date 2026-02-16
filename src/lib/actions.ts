"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateHostToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function createRoom(): Promise<{
  success: boolean;
  code?: string;
  hostToken?: string;
  error?: string;
}> {
  try {
    let code = generateRoomCode();
    let attempts = 0;

    while (attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from("rooms")
        .select("id")
        .eq("code", code)
        .single();

      if (!existing) break;
      code = generateRoomCode();
      attempts++;
    }

    const hostToken = generateHostToken();

    const { error } = await supabaseAdmin.from("rooms").insert({
      code,
      status: "waiting",
      host_token: hostToken,
    });

    if (error) throw error;

    return { success: true, code, hostToken };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as {message: string}).message) : "Failed to create room";
    console.error("[createRoom]", err);
    return { success: false, error: message };
  }
}

export async function joinRoom(
  roomCode: string,
  playerName: string
): Promise<{
  success: boolean;
  playerId?: string;
  roomId?: string;
  error?: string;
}> {
  try {
    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedName = playerName.trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      return { success: false, error: "Invalid room code" };
    }

    if (!trimmedName || trimmedName.length < 1 || trimmedName.length > 30) {
      return { success: false, error: "Name must be 1-30 characters" };
    }

    const { data: room, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("id, status")
      .eq("code", trimmedCode)
      .single();

    if (roomError || !room) {
      return { success: false, error: "Room not found" };
    }

    if (room.status === "revealed") {
      return { success: false, error: "Game already ended" };
    }

    const { data: existingPlayer } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("name", trimmedName)
      .single();

    if (existingPlayer) {
      return { success: false, error: "Name already taken in this room" };
    }

    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .insert({
        room_id: room.id,
        name: trimmedName,
        number: null,
      })
      .select("id")
      .single();

    if (playerError || !player) {
      throw playerError || new Error("Failed to join room");
    }

    return { success: true, playerId: player.id, roomId: room.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as {message: string}).message) : "Failed to join room";
    console.error("[joinRoom]", err);
    return { success: false, error: message };
  }
}

export async function submitNumber(
  playerId: string,
  number: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!Number.isInteger(number) || number < 1 || number > 100) {
      return { success: false, error: "Number must be between 1 and 100" };
    }

    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, number")
      .eq("id", playerId)
      .single();

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    if (player.number !== null) {
      return { success: false, error: "Already submitted" };
    }

    const { error } = await supabaseAdmin
      .from("players")
      .update({ number })
      .eq("id", playerId);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as {message: string}).message) : "Failed to submit";
    console.error("[submitNumber]", err);
    return { success: false, error: message };
  }
}

export async function revealResults(
  roomCode: string,
  hostToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, host_token, status")
      .eq("code", roomCode)
      .single();

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.host_token !== hostToken) {
      return { success: false, error: "Unauthorized" };
    }

    if (room.status === "revealed") {
      return { success: false, error: "Already revealed" };
    }

    const { data: players } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("room_id", room.id);

    if (!players || players.length < 3) {
      return { success: false, error: "Need at least 3 players" };
    }

    const allSubmitted = players.every((p: { number: number | null }) => p.number !== null);
    if (!allSubmitted) {
      return { success: false, error: "Not all players have submitted" };
    }

    const { error } = await supabaseAdmin
      .from("rooms")
      .update({ status: "revealed" })
      .eq("id", room.id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as {message: string}).message) : "Failed to reveal";
    console.error("[revealResults]", err);
    return { success: false, error: message };
  }
}

export async function restartGame(
  roomCode: string,
  hostToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, host_token")
      .eq("code", roomCode)
      .single();

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.host_token !== hostToken) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete all players from the room
    await supabaseAdmin.from("players").delete().eq("room_id", room.id);

    // Reset room status to waiting
    const { error } = await supabaseAdmin
      .from("rooms")
      .update({ status: "waiting" })
      .eq("id", room.id);

    if (error) throw error;

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String((err as {message: string}).message) : "Failed to restart";
    console.error("[restartGame]", err);
    return { success: false, error: message };
  }
}

export async function getRoomData(roomCode: string) {
  const { data: room } = await supabaseAdmin
    .from("rooms")
    .select("*")
    .eq("code", roomCode)
    .single();

  if (!room) return null;

  const { data: players } = await supabaseAdmin
    .from("players")
    .select("*")
    .eq("room_id", room.id)
    .order("created_at", { ascending: true });

  return { room, players: players || [] };
}
