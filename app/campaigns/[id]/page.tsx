"use client";

import { useState, useEffect, use, useRef, TouchEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Modal } from '@/app/components/ui/modal';
import { useConfirm } from '@/app/components/ui/confirm-dialog';
import { useToast } from '@/app/components/ui/toast';
import {
  Campaign,
  CampaignSession,
  CampaignNote,
  CampaignNPC,
  CampaignLocation,
  CampaignQuest,
  QuestObjective,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  getDifficultyColor,
  getDifficultyLabel,
  formatCampaignDate,
  getCampaignDuration,
} from '@/app/types/campaign';
import { Character } from '@/app/types/character';
import { QuestBoard } from '@/app/components/campaign/quest-board';
import { NPCRelationshipGraph } from '@/app/components/campaign/npc-relationship-graph';
import { safeParseLocalStorage } from '@/app/lib/utils/json-utils';

type TabType = 'overview' | 'notes' | 'sessions' | 'npcs' | 'locations' | 'quests' | 'quest-board' | 'npc-graph';

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm } = useConfirm();
  const { addToast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Data for each section
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [sessions, setSessions] = useState<CampaignSession[]>([]);
  const [npcs, setNPCs] = useState<CampaignNPC[]>([]);
  const [locations, setLocations] = useState<CampaignLocation[]>([]);
  const [quests, setQuests] = useState<CampaignQuest[]>([]);

  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);

  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '🏠' },
    { key: 'notes', label: 'Notes', icon: '📝' },
    { key: 'sessions', label: 'Sessions', icon: '📅' },
    { key: 'npcs', label: 'NPCs', icon: '👥' },
    { key: 'npc-graph', label: 'NPC Map', icon: '🕸️' },
    { key: 'locations', label: 'Locations', icon: '🗺️' },
    { key: 'quests', label: 'Quests', icon: '⚔️' },
    { key: 'quest-board', label: 'Quest Board', icon: '📋' },
  ];

  useEffect(() => {
    // Load campaign
    const stored = localStorage.getItem('dnd-campaigns');
    if (stored) {
      try {
        const campaigns: Campaign[] = JSON.parse(stored);
        const found = campaigns.find((c) => c.id === id);
        if (found) {
          setCampaign(found);

          // Load associated characters
          const charsStored = localStorage.getItem('dnd-characters');
          if (charsStored) {
            const allCharacters: Character[] = JSON.parse(charsStored);
            if (found.characterIds.length > 0) {
              const campaignChars = allCharacters.filter((char) =>
                found.characterIds.includes(char.id)
              );
              setCharacters(campaignChars);
            } else {
              // No characters yet, but we should still set empty array
              setCharacters([]);
            }
          }
        }
      } catch (error) {
        // Failed to load campaign
      }
    }

    // Load campaign-specific data
    setNotes(safeParseLocalStorage<CampaignNote[]>(`dnd-campaign-notes-${id}`, []));
    setSessions(safeParseLocalStorage<CampaignSession[]>(`dnd-campaign-sessions-${id}`, []));
    setNPCs(safeParseLocalStorage<CampaignNPC[]>(`dnd-campaign-npcs-${id}`, []));
    setLocations(safeParseLocalStorage<CampaignLocation[]>(`dnd-campaign-locations-${id}`, []));
    setQuests(safeParseLocalStorage<CampaignQuest[]>(`dnd-campaign-quests-${id}`, []));
  }, [id]);

  const loadCampaignData = () => {
    setNotes(safeParseLocalStorage<CampaignNote[]>(`dnd-campaign-notes-${id}`, []));
    setSessions(safeParseLocalStorage<CampaignSession[]>(`dnd-campaign-sessions-${id}`, []));
    setNPCs(safeParseLocalStorage<CampaignNPC[]>(`dnd-campaign-npcs-${id}`, []));
    setLocations(safeParseLocalStorage<CampaignLocation[]>(`dnd-campaign-locations-${id}`, []));
    setQuests(safeParseLocalStorage<CampaignQuest[]>(`dnd-campaign-quests-${id}`, []));
  };

  const saveCampaignData = (
    type: 'notes' | 'sessions' | 'npcs' | 'locations' | 'quests',
    data: CampaignNote[] | CampaignSession[] | CampaignNPC[] | CampaignLocation[] | CampaignQuest[]
  ) => {
    localStorage.setItem(`dnd-campaign-${type}-${id}`, JSON.stringify(data));
  };

  const deleteCampaign = async () => {
    const confirmed = await confirm({
      title: 'Delete Campaign',
      message: 'Delete ' + (campaign?.name || 'this campaign') + '? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const stored = localStorage.getItem('dnd-campaigns');
      if (stored) {
        const campaigns: Campaign[] = JSON.parse(stored);
        const updated = campaigns.filter((c) => c.id !== id);
        localStorage.setItem('dnd-campaigns', JSON.stringify(updated));

        // Clean up campaign data
        localStorage.removeItem(`dnd-campaign-notes-${id}`);
        localStorage.removeItem(`dnd-campaign-sessions-${id}`);
        localStorage.removeItem(`dnd-campaign-npcs-${id}`);
        localStorage.removeItem(`dnd-campaign-locations-${id}`);
        localStorage.removeItem(`dnd-campaign-quests-${id}`);

        addToast((campaign?.name || 'Campaign') + ' deleted', 'success');
        router.push('/campaigns');
      }
    }
  };

  // Swipe handlers
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = tabs.findIndex(t => t.key === activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].key);
    }

    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].key);
    }
  };

  // Add/Edit Note
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'npc' | 'location' | 'quest' | 'lore' | 'other'>('other');
  const [noteTags, setNoteTags] = useState('');
  const [notePublic, setNotePublic] = useState(false);

  const saveNote = () => {
    if (!noteTitle.trim()) return;

    if (editingNoteId) {
      // Edit existing note
      const updatedNotes = notes.map(n =>
        n.id === editingNoteId
          ? {
              ...n,
              title: noteTitle,
              content: noteContent,
              category: noteCategory,
              tags: noteTags.split(',').map(t => t.trim()).filter(t => t),
              isPublic: notePublic,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      setNotes(updatedNotes);
      saveCampaignData('notes', updatedNotes);
    } else {
      // Add new note
      const newNote: CampaignNote = {
        id: crypto.randomUUID(),
        campaignId: id,
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        tags: noteTags.split(',').map(t => t.trim()).filter(t => t),
        isPublic: notePublic,
        createdBy: 'dm', // TODO: Implement user authentication and use actual user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveCampaignData('notes', updatedNotes);
    }

    // Reset form
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('other');
    setNoteTags('');
    setNotePublic(false);
    setShowNoteModal(false);
  };

  const editNote = (note: CampaignNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setNoteTags(note.tags.join(', '));
    setNotePublic(note.isPublic);
    setShowNoteModal(true);
  };

  const deleteNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Delete "' + (note?.title || 'this note') + '"?',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
      saveCampaignData('notes', updated);
      addToast('Note deleted', 'success');
    }
  };

  // Add/Edit Session
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionXP, setSessionXP] = useState(0);

  const saveSession = () => {
    if (!sessionTitle.trim()) return;

    if (editingSessionId) {
      // Edit existing session
      const updatedSessions = sessions.map(s =>
        s.id === editingSessionId
          ? { ...s, title: sessionTitle, summary: sessionSummary, date: sessionDate, xpAwarded: sessionXP }
          : s
      );
      setSessions(updatedSessions);
      saveCampaignData('sessions', updatedSessions);
    } else {
      // Add new session
      const newSession: CampaignSession = {
        id: crypto.randomUUID(),
        campaignId: id,
        sessionNumber: sessions.length + 1,
        title: sessionTitle,
        summary: sessionSummary,
        date: sessionDate,
        duration: 240, // Default 4 hours
        attendees: campaign?.characterIds || [],
        xpAwarded: sessionXP,
        treasureAwarded: [],
        notes: '',
        createdAt: new Date().toISOString(),
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      saveCampaignData('sessions', updatedSessions);

      // Update campaign session count
      if (campaign) {
        const updatedCampaign = { ...campaign, sessionCount: campaign.sessionCount + 1 };
        setCampaign(updatedCampaign);

        const stored = localStorage.getItem('dnd-campaigns');
        if (stored) {
          const campaigns: Campaign[] = JSON.parse(stored);
          const updated = campaigns.map(c => c.id === id ? updatedCampaign : c);
          localStorage.setItem('dnd-campaigns', JSON.stringify(updated));
        }
      }
    }

    // Reset form
    setEditingSessionId(null);
    setSessionTitle('');
    setSessionSummary('');
    setSessionXP(0);
    setShowSessionModal(false);
  };

  const editSession = (session: CampaignSession) => {
    setEditingSessionId(session.id);
    setSessionTitle(session.title);
    setSessionSummary(session.summary);
    setSessionDate(session.date);
    setSessionXP(session.xpAwarded);
    setShowSessionModal(true);
  };

  const deleteSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    const confirmed = await confirm({
      title: 'Delete Session',
      message: 'Delete session "' + (session?.title || 'this session') + '"?',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      saveCampaignData('sessions', updated);
      addToast('Session deleted', 'success');
    }
  };

  // Add/Edit NPC
  const [editingNPCId, setEditingNPCId] = useState<string | null>(null);
  const [npcName, setNpcName] = useState('');
  const [npcRace, setNpcRace] = useState('');
  const [npcOccupation, setNpcOccupation] = useState('');
  const [npcLocation, setNpcLocation] = useState('');
  const [npcDescription, setNpcDescription] = useState('');
  const [npcRelationship, setNpcRelationship] = useState<'ally' | 'neutral' | 'enemy' | 'unknown'>('neutral');
  const [npcNotes, setNpcNotes] = useState('');
  const [npcPublic, setNpcPublic] = useState(false);

  const saveNPC = () => {
    if (!npcName.trim()) return;

    if (editingNPCId) {
      // Edit existing NPC
      const updatedNPCs = npcs.map(n =>
        n.id === editingNPCId
          ? {
              ...n,
              name: npcName,
              race: npcRace || undefined,
              occupation: npcOccupation || undefined,
              location: npcLocation || undefined,
              description: npcDescription,
              relationship: npcRelationship,
              notes: npcNotes,
              isPublic: npcPublic,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      setNPCs(updatedNPCs);
      saveCampaignData('npcs', updatedNPCs);
    } else {
      // Add new NPC
      const newNPC: CampaignNPC = {
        id: crypto.randomUUID(),
        campaignId: id,
        name: npcName,
        race: npcRace || undefined,
        occupation: npcOccupation || undefined,
        location: npcLocation || undefined,
        description: npcDescription,
        relationship: npcRelationship,
        status: 'alive',
        notes: npcNotes,
        isPublic: npcPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedNPCs = [newNPC, ...npcs];
      setNPCs(updatedNPCs);
      saveCampaignData('npcs', updatedNPCs);
    }

    // Reset form
    setEditingNPCId(null);
    setNpcName('');
    setNpcRace('');
    setNpcOccupation('');
    setNpcLocation('');
    setNpcDescription('');
    setNpcRelationship('neutral');
    setNpcNotes('');
    setNpcPublic(false);
    setShowNPCModal(false);
  };

  const editNPC = (npc: CampaignNPC) => {
    setEditingNPCId(npc.id);
    setNpcName(npc.name);
    setNpcRace(npc.race || '');
    setNpcOccupation(npc.occupation || '');
    setNpcLocation(npc.location || '');
    setNpcDescription(npc.description);
    setNpcRelationship(npc.relationship);
    setNpcNotes(npc.notes);
    setNpcPublic(npc.isPublic);
    setShowNPCModal(true);
  };

  const deleteNPC = async (npcId: string) => {
    const npc = npcs.find((n) => n.id === npcId);
    const confirmed = await confirm({
      title: 'Delete NPC',
      message: 'Delete ' + (npc?.name || 'this NPC') + '?',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const updated = npcs.filter((n) => n.id !== npcId);
      setNPCs(updated);
      saveCampaignData('npcs', updated);
      addToast((npc?.name || 'NPC') + ' deleted', 'success');
    }
  };

  // Add/Edit Location
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState<'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'building' | 'other'>('town');
  const [locationDescription, setLocationDescription] = useState('');
  const [locationPopulation, setLocationPopulation] = useState('');
  const [locationPublic, setLocationPublic] = useState(false);

  const saveLocation = () => {
    if (!locationName.trim()) return;

    if (editingLocationId) {
      // Edit existing location
      const updatedLocations = locations.map(l =>
        l.id === editingLocationId
          ? {
              ...l,
              name: locationName,
              type: locationType,
              description: locationDescription,
              population: locationPopulation || undefined,
              isPublic: locationPublic,
              updatedAt: new Date().toISOString(),
            }
          : l
      );
      setLocations(updatedLocations);
      saveCampaignData('locations', updatedLocations);
    } else {
      // Add new location
      const newLocation: CampaignLocation = {
        id: crypto.randomUUID(),
        campaignId: id,
        name: locationName,
        type: locationType,
        description: locationDescription,
        population: locationPopulation || undefined,
        notableFeatures: [],
        connectedLocations: [],
        npcs: [],
        isPublic: locationPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedLocations = [newLocation, ...locations];
      setLocations(updatedLocations);
      saveCampaignData('locations', updatedLocations);
    }

    // Reset form
    setEditingLocationId(null);
    setLocationName('');
    setLocationType('town');
    setLocationDescription('');
    setLocationPopulation('');
    setLocationPublic(false);
    setShowLocationModal(false);
  };

  const editLocation = (location: CampaignLocation) => {
    setEditingLocationId(location.id);
    setLocationName(location.name);
    setLocationType(location.type);
    setLocationDescription(location.description);
    setLocationPopulation(location.population || '');
    setLocationPublic(location.isPublic);
    setShowLocationModal(true);
  };

  const deleteLocation = async (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    const confirmed = await confirm({
      title: 'Delete Location',
      message: 'Delete ' + (location?.name || 'this location') + '?',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const updated = locations.filter((l) => l.id !== locationId);
      setLocations(updated);
      saveCampaignData('locations', updated);
      addToast((location?.name || 'Location') + ' deleted', 'success');
    }
  };

  // Add/Edit Quest
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questTitle, setQuestTitle] = useState('');
  const [questDescription, setQuestDescription] = useState('');
  const [questGiver, setQuestGiver] = useState('');
  const [questStatus, setQuestStatus] = useState<'available' | 'active' | 'completed' | 'failed'>('available');
  const [questPriority, setQuestPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [questRewards, setQuestRewards] = useState('');
  const [questPublic, setQuestPublic] = useState(false);
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [newObjectiveOptional, setNewObjectiveOptional] = useState(false);

  const saveQuest = () => {
    if (!questTitle.trim()) return;

    if (editingQuestId) {
      // Edit existing quest
      const updatedQuests = quests.map(q =>
        q.id === editingQuestId
          ? {
              ...q,
              title: questTitle,
              description: questDescription,
              giver: questGiver || undefined,
              status: questStatus,
              priority: questPriority,
              rewards: questRewards.split(',').map(r => r.trim()).filter(r => r),
              isPublic: questPublic,
              updatedAt: new Date().toISOString(),
            }
          : q
      );
      setQuests(updatedQuests);
      saveCampaignData('quests', updatedQuests);
    } else {
      // Add new quest
      const newQuest: CampaignQuest = {
        id: crypto.randomUUID(),
        campaignId: id,
        title: questTitle,
        description: questDescription,
        giver: questGiver || undefined,
        status: questStatus,
        priority: questPriority,
        objectives: [],
        rewards: questRewards.split(',').map(r => r.trim()).filter(r => r),
        notes: '',
        isPublic: questPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedQuests = [newQuest, ...quests];
      setQuests(updatedQuests);
      saveCampaignData('quests', updatedQuests);
    }

    // Reset form
    setEditingQuestId(null);
    setQuestTitle('');
    setQuestDescription('');
    setQuestGiver('');
    setQuestStatus('available');
    setQuestPriority('medium');
    setQuestRewards('');
    setQuestPublic(false);
    setShowQuestModal(false);
  };

  const editQuest = (quest: CampaignQuest) => {
    setEditingQuestId(quest.id);
    setQuestTitle(quest.title);
    setQuestDescription(quest.description);
    setQuestGiver(quest.giver || '');
    setQuestStatus(quest.status);
    setQuestPriority(quest.priority);
    setQuestRewards(quest.rewards.join(', '));
    setQuestPublic(quest.isPublic);
    setShowQuestModal(true);
  };

  const deleteQuest = async (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    const confirmed = await confirm({
      title: 'Delete Quest',
      message: 'Delete quest "' + (quest?.title || 'this quest') + '"?',
      confirmLabel: 'Delete',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      const updated = quests.filter((q) => q.id !== questId);
      setQuests(updated);
      saveCampaignData('quests', updated);
      addToast('Quest deleted', 'success');
    }
  };

  const updateQuest = (updatedQuest: CampaignQuest) => {
    const updatedQuests = quests.map(q =>
      q.id === updatedQuest.id ? updatedQuest : q
    );
    setQuests(updatedQuests);
    saveCampaignData('quests', updatedQuests);
  };

  // Quest Objectives Management
  const toggleObjectiveComplete = (questId: string, objectiveId: string) => {
    const updatedQuests = quests.map(q =>
      q.id === questId
        ? {
            ...q,
            objectives: q.objectives.map(obj =>
              obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
            ),
            updatedAt: new Date().toISOString(),
          }
        : q
    );
    setQuests(updatedQuests);
    saveCampaignData('quests', updatedQuests);
  };

  const deleteObjective = (questId: string, objectiveId: string) => {
    const updatedQuests = quests.map(q =>
      q.id === questId
        ? {
            ...q,
            objectives: q.objectives.filter(obj => obj.id !== objectiveId),
            updatedAt: new Date().toISOString(),
          }
        : q
    );
    setQuests(updatedQuests);
    saveCampaignData('quests', updatedQuests);
  };

  const addObjectiveToQuest = (questId: string, description: string, optional: boolean = false) => {
    if (!description.trim()) return;

    const newObjective: QuestObjective = {
      id: crypto.randomUUID(),
      description: description.trim(),
      completed: false,
      optional,
    };

    const updatedQuests = quests.map(q =>
      q.id === questId
        ? {
            ...q,
            objectives: [...q.objectives, newObjective],
            updatedAt: new Date().toISOString(),
          }
        : q
    );
    setQuests(updatedQuests);
    saveCampaignData('quests', updatedQuests);
  };

  // Edit Campaign State
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editCampaignDescription, setEditCampaignDescription] = useState('');
  const [editCampaignSetting, setEditCampaignSetting] = useState('');
  const [editCampaignEdition, setEditCampaignEdition] = useState<'5e' | '2024'>('5e');
  const [editCampaignDifficulty, setEditCampaignDifficulty] = useState<'easy' | 'normal' | 'hard' | 'deadly'>('normal');
  const [editCampaignStatus, setEditCampaignStatus] = useState<'planning' | 'active' | 'on-hold' | 'completed'>('active');

  // Edit Campaign Functions
  const openEditCampaignModal = () => {
    if (!campaign) return;
    setEditCampaignName(campaign.name);
    setEditCampaignDescription(campaign.description || '');
    setEditCampaignSetting(campaign.setting);
    setEditCampaignEdition(campaign.edition);
    setEditCampaignDifficulty(campaign.difficultyLevel);
    setEditCampaignStatus(campaign.status);
    setShowEditCampaignModal(true);
  };

  const saveCampaignEdit = () => {
    if (!campaign || !editCampaignName.trim()) return;

    const updatedCampaign: Campaign = {
      ...campaign,
      name: editCampaignName.trim(),
      description: editCampaignDescription.trim(),
      setting: editCampaignSetting.trim(),
      edition: editCampaignEdition,
      difficultyLevel: editCampaignDifficulty,
      status: editCampaignStatus,
      updatedAt: new Date().toISOString(),
    };

    setCampaign(updatedCampaign);

    // Update in localStorage
    const stored = localStorage.getItem('dnd-campaigns');
    if (stored) {
      try {
        const campaigns: Campaign[] = JSON.parse(stored);
        const updated = campaigns.map(c => c.id === id ? updatedCampaign : c);
        localStorage.setItem('dnd-campaigns', JSON.stringify(updated));
      } catch {
        addToast('Failed to update campaign data', 'error');
        return;
      }
    }

    setShowEditCampaignModal(false);
  };

  // Add Character to Campaign
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  const openAddCharacterModal = () => {
    // Load all characters from localStorage
    const charsStored = localStorage.getItem('dnd-characters');
    if (charsStored) {
      try {
        const allChars: Character[] = JSON.parse(charsStored);
        // Filter out characters already in this campaign
        const available = allChars.filter(char => !campaign?.characterIds.includes(char.id));
        setAvailableCharacters(available);
      } catch {
        addToast('Failed to load characters', 'error');
        return;
      }
    }
    setShowAddCharacterModal(true);
  };

  const addCharacterToCampaign = () => {
    if (!campaign || !selectedCharacterId) return;

    const charsStored = localStorage.getItem('dnd-characters');
    if (!charsStored) return;

    let allCharacters: Character[];
    try {
      allCharacters = JSON.parse(charsStored);
    } catch {
      addToast('Failed to load characters', 'error');
      return;
    }
    const character = allCharacters.find(c => c.id === selectedCharacterId);
    if (!character) return;

    // Update campaign
    const updatedCampaign: Campaign = {
      ...campaign,
      characterIds: [...campaign.characterIds, character.id],
      playerIds: campaign.playerIds.includes(character.playerId)
        ? campaign.playerIds
        : [...campaign.playerIds, character.playerId],
      updatedAt: new Date().toISOString(),
    };

    // Update character
    const updatedCharacter: Character = {
      ...character,
      campaignId: campaign.id,
      updatedAt: new Date().toISOString(),
    };

    // Save campaign
    const campaignsStored = localStorage.getItem('dnd-campaigns');
    if (campaignsStored) {
      try {
        const campaigns: Campaign[] = JSON.parse(campaignsStored);
        const updatedCampaigns = campaigns.map(c => c.id === id ? updatedCampaign : c);
        localStorage.setItem('dnd-campaigns', JSON.stringify(updatedCampaigns));
      } catch {
        addToast('Failed to update campaign data', 'error');
        return;
      }
    }

    // Save character
    const updatedCharacters = allCharacters.map(c => c.id === character.id ? updatedCharacter : c);
    localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));

    // Update local state
    setCampaign(updatedCampaign);
    setCharacters([...characters, updatedCharacter]);

    // Close modal and reset
    setShowAddCharacterModal(false);
    setSelectedCharacterId('');
  };

  const removeCharacterFromCampaign = async (characterId: string) => {
    if (!campaign) return;

    const characterToRemove = characters.find((c) => c.id === characterId);
    const confirmed = await confirm({
      title: 'Remove Character',
      message: 'Remove ' + (characterToRemove?.name || 'this character') + ' from the campaign?',
      confirmLabel: 'Remove',
      confirmVariant: 'danger',
    });

    if (!confirmed) return;

    const charsStored = localStorage.getItem('dnd-characters');
    if (!charsStored) return;

    let allCharacters: Character[];
    try {
      allCharacters = JSON.parse(charsStored);
    } catch {
      addToast('Failed to load characters', 'error');
      return;
    }
    const character = allCharacters.find((c) => c.id === characterId);
    if (!character) return;

    // Update campaign
    const updatedCampaign: Campaign = {
      ...campaign,
      characterIds: campaign.characterIds.filter(id => id !== characterId),
      // Remove player if they have no other characters in campaign
      playerIds: campaign.characterIds.filter(id => id !== characterId).some(
        charId => allCharacters.find(c => c.id === charId)?.playerId === character.playerId
      ) ? campaign.playerIds : campaign.playerIds.filter(pid => pid !== character.playerId),
      updatedAt: new Date().toISOString(),
    };

    // Update character
    const updatedCharacter: Character = {
      ...character,
      campaignId: undefined,
      updatedAt: new Date().toISOString(),
    };

    // Save campaign
    const campaignsStored = localStorage.getItem('dnd-campaigns');
    if (campaignsStored) {
      try {
        const campaigns: Campaign[] = JSON.parse(campaignsStored);
        const updatedCampaigns = campaigns.map(c => c.id === id ? updatedCampaign : c);
        localStorage.setItem('dnd-campaigns', JSON.stringify(updatedCampaigns));
      } catch {
        addToast('Failed to update campaign data', 'error');
        return;
      }
    }

    // Save character
    const updatedCharacters = allCharacters.map(c => c.id === character.id ? updatedCharacter : c);
    localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));

    // Update local state
    setCampaign(updatedCampaign);
    setCharacters(characters.filter((c) => c.id !== characterId));
    addToast((character?.name || 'Character') + ' removed from campaign', 'success');
  };

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <div className="text-[#fafafa] text-xl mb-4">Campaign not found</div>
          <Link href="/campaigns">
            <Button variant="primary">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const duration = getCampaignDuration(campaign.startDate);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/campaigns">
            <Button variant="secondary" size="sm">
              ← Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={openEditCampaignModal}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={deleteCampaign}>
              Delete
            </Button>
          </div>
        </div>

        {/* Campaign Title */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-[#fafafa]">
              {campaign.name}
            </h1>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getStatusBgColor(
                campaign.status
              )} ${getStatusColor(campaign.status)}`}
            >
              {getStatusLabel(campaign.status)}
            </span>
          </div>
          <p className="text-[#a1a1aa]">
            {campaign.description || 'No description provided'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="glass rounded-xl p-2 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#8b5cf6] text-white'
                    : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a]'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Swipe Support */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#8b5cf6] mb-1">
                    {campaign.currentLevel}
                  </div>
                  <div className="text-sm text-[#a1a1aa]">Level</div>
                </div>
                <div className="glass rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#fbbf24] mb-1">
                    {sessions.length}
                  </div>
                  <div className="text-sm text-[#a1a1aa]">Sessions</div>
                </div>
                <div className="glass rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#10b981] mb-1">
                    {characters.length}
                  </div>
                  <div className="text-sm text-[#a1a1aa]">Characters</div>
                </div>
                <div className="glass rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-[#ef4444] mb-1">
                    {duration}
                  </div>
                  <div className="text-sm text-[#a1a1aa]">Days</div>
                </div>
              </div>

              {/* Party Members */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#fafafa]">
                    Party Members
                  </h2>
                  <Button variant="primary" size="sm" onClick={openAddCharacterModal}>
                    + Add Character
                  </Button>
                </div>
                {characters.length === 0 ? (
                  <div className="text-center py-8 text-[#a1a1aa]">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-sm">No characters yet</p>
                    <p className="text-xs mt-2">Click &quot;Add Character&quot; to add party members</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {characters.map((character) => (
                      <div
                        key={character.id}
                        className="glass-subtle rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-2xl">
                            ⚔️
                          </div>
                          <div>
                            <div className="font-semibold text-[#fafafa]">
                              {character.name}
                            </div>
                            <div className="text-sm text-[#a1a1aa]">
                              Level {character.level} {character.race}{' '}
                              {character.classes.map((c) => c.name).join('/')}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/characters/${character.id}`}>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </Link>
                          <button
                            onClick={() => removeCharacterFromCampaign(character.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                            title="Remove from campaign"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaign Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                    Details
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-[#a1a1aa]">Setting</div>
                      <div className="text-sm font-medium text-[#fafafa]">
                        {campaign.setting}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a1a1aa]">Edition</div>
                      <div className="text-sm font-medium text-[#fafafa]">
                        D&D {campaign.edition}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a1a1aa]">Difficulty</div>
                      <div className={`text-sm font-medium capitalize ${getDifficultyColor(campaign.difficultyLevel)}`}>
                        {getDifficultyLabel(campaign.difficultyLevel)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#a1a1aa]">Started</div>
                      <div className="text-sm font-medium text-[#fafafa]">
                        {formatCampaignDate(campaign.startDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                    Quick Stats
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#a1a1aa]">Notes</span>
                      <span className="text-sm font-medium text-[#fafafa]">{notes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#a1a1aa]">NPCs</span>
                      <span className="text-sm font-medium text-[#fafafa]">{npcs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#a1a1aa]">Locations</span>
                      <span className="text-sm font-medium text-[#fafafa]">{locations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#a1a1aa]">Active Quests</span>
                      <span className="text-sm font-medium text-[#fafafa]">
                        {quests.filter(q => q.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#fafafa]">Notes</h2>
                <Button variant="primary" onClick={() => setShowNoteModal(true)}>
                  + Add Note
                </Button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              note.category === 'npc' ? 'bg-blue-500/20 text-blue-400' :
                              note.category === 'location' ? 'bg-green-500/20 text-green-400' :
                              note.category === 'quest' ? 'bg-purple-500/20 text-purple-400' :
                              note.category === 'lore' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {note.category}
                            </span>
                            {note.isPublic && (
                              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                Public
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editNote(note)}
                            className="text-[#a1a1aa] hover:text-[#8b5cf6] transition-colors px-2"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#a1a1aa] mb-2 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-[#27272a] text-[#fafafa] rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-[#52525b] mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#fafafa]">Sessions</h2>
                <Button variant="primary" onClick={() => setShowSessionModal(true)}>
                  + Add Session
                </Button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg">No sessions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="glass-subtle rounded-lg p-4 hover:bg-[#27272a] transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="flex-1"
                          onClick={() => router.push(`/campaigns/${id}/sessions/${session.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-[#8b5cf6]">
                              #{session.sessionNumber}
                            </span>
                            <h3 className="text-lg font-semibold text-[#fafafa] group-hover:text-[#8b5cf6] transition-colors">
                              {session.title}
                            </h3>
                          </div>
                          <p className="text-sm text-[#a1a1aa] mb-2 whitespace-pre-wrap">
                            {session.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#a1a1aa]">
                            <span>📅 {new Date(session.date).toLocaleDateString()}</span>
                            {session.xpAwarded > 0 && (
                              <span className="text-green-400">✨ {session.xpAwarded} XP</span>
                            )}
                            <span>👥 {session.attendees.length} players</span>
                          </div>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => editSession(session)}
                            className="text-[#a1a1aa] hover:text-[#8b5cf6] transition-colors px-2"
                            title="Edit session"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                            title="Delete session"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NPCs Tab */}
          {activeTab === 'npcs' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#fafafa]">NPCs</h2>
                <Button variant="primary" onClick={() => setShowNPCModal(true)}>
                  + Add NPC
                </Button>
              </div>

              {npcs.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-lg">No NPCs yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {npcs.map((npc) => (
                    <div key={npc.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
                            {npc.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {npc.race && (
                              <span className="text-xs text-[#a1a1aa]">{npc.race}</span>
                            )}
                            {npc.occupation && (
                              <span className="text-xs text-[#a1a1aa]">• {npc.occupation}</span>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            npc.relationship === 'ally' ? 'bg-green-500/20 text-green-400' :
                            npc.relationship === 'enemy' ? 'bg-red-500/20 text-red-400' :
                            npc.relationship === 'neutral' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {npc.relationship}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editNPC(npc)}
                            className="text-[#a1a1aa] hover:text-[#8b5cf6] transition-colors px-2"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteNPC(npc.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#a1a1aa] mb-2">
                        {npc.description}
                      </p>
                      {npc.location && (
                        <div className="text-xs text-[#52525b]">
                          📍 {npc.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#fafafa]">Locations</h2>
                <Button variant="primary" onClick={() => setShowLocationModal(true)}>
                  + Add Location
                </Button>
              </div>

              {locations.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-lg">No locations yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
                            {location.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            location.type === 'city' ? 'bg-purple-500/20 text-purple-400' :
                            location.type === 'town' ? 'bg-blue-500/20 text-blue-400' :
                            location.type === 'village' ? 'bg-green-500/20 text-green-400' :
                            location.type === 'dungeon' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {location.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editLocation(location)}
                            className="text-[#a1a1aa] hover:text-[#8b5cf6] transition-colors px-2"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteLocation(location.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[#a1a1aa] mb-2">
                        {location.description}
                      </p>
                      {location.population && (
                        <div className="text-xs text-[#52525b]">
                          👥 Population: {location.population}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#fafafa]">Quests</h2>
                <Button variant="primary" onClick={() => setShowQuestModal(true)}>
                  + Add Quest
                </Button>
              </div>

              {quests.length === 0 ? (
                <div className="text-center py-12 text-[#a1a1aa]">
                  <div className="text-6xl mb-4">⚔️</div>
                  <p className="text-lg">No quests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div key={quest.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                            {quest.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              quest.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              quest.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              quest.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {quest.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              quest.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              quest.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              quest.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {quest.priority}
                            </span>
                          </div>
                          <p className="text-sm text-[#a1a1aa] mb-2">
                            {quest.description}
                          </p>
                          {quest.giver && (
                            <div className="text-xs text-[#52525b] mb-1">
                              Quest Giver: {quest.giver}
                            </div>
                          )}

                          {/* Quest Objectives */}
                          {quest.objectives.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-xs font-medium text-[#fafafa] mb-1">Objectives:</div>
                              {quest.objectives.map((objective) => (
                                <div key={objective.id} className="flex items-center gap-2 group">
                                  <input
                                    type="checkbox"
                                    checked={objective.completed}
                                    onChange={() => toggleObjectiveComplete(quest.id, objective.id)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                  <span className={`text-sm flex-1 ${
                                    objective.completed
                                      ? 'line-through text-[#52525b]'
                                      : 'text-[#a1a1aa]'
                                  }`}>
                                    {objective.description}
                                    {objective.optional && (
                                      <span className="text-xs text-[#8b5cf6] ml-2">(optional)</span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => deleteObjective(quest.id, objective.id)}
                                    className="opacity-0 group-hover:opacity-100 text-[#a1a1aa] hover:text-red-400 transition-all text-xs px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Objective */}
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Add objective..."
                                className="flex-1 px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-sm text-[#fafafa] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.currentTarget;
                                    addObjectiveToQuest(quest.id, input.value, false);
                                    input.value = '';
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                  addObjectiveToQuest(quest.id, input.value, false);
                                  input.value = '';
                                }}
                                className="text-xs px-2 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {quest.rewards.length > 0 && (
                            <div className="text-xs text-green-400 mt-2">
                              💰 Rewards: {quest.rewards.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editQuest(quest)}
                            className="text-[#a1a1aa] hover:text-[#8b5cf6] transition-colors px-2"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteQuest(quest.id)}
                            className="text-[#a1a1aa] hover:text-red-400 transition-colors px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quest Board Tab */}
          {activeTab === 'quest-board' && (
            <QuestBoard
              quests={quests}
              onQuestUpdate={updateQuest}
              onQuestEdit={editQuest}
              onQuestDelete={deleteQuest}
              onQuestAdd={() => setShowQuestModal(true)}
            />
          )}

          {/* NPC Relationship Graph Tab */}
          {activeTab === 'npc-graph' && (
            <NPCRelationshipGraph
              npcs={npcs}
              onNPCClick={(npc) => {
                editNPC(npc);
              }}
            />
          )}
        </div>

        {/* Add/Edit Note Modal */}
        <Modal
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setEditingNoteId(null);
            setNoteTitle('');
            setNoteContent('');
            setNoteCategory('other');
            setNoteTags('');
            setNotePublic(false);
          }}
          title={editingNoteId ? "Edit Note" : "Add Note"}
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Title"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {(['npc', 'location', 'quest', 'lore', 'other'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoteCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      noteCategory === cat
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Content
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Note content..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[120px]"
              />
            </div>

            <Input
              type="text"
              label="Tags (comma-separated)"
              placeholder="combat, session-1, important"
              value={noteTags}
              onChange={(e) => setNoteTags(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="note-public"
                checked={notePublic}
                onChange={(e) => setNotePublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="note-public" className="text-sm text-[#fafafa]">
                Visible to players
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowNoteModal(false);
                setEditingNoteId(null);
                setNoteTitle('');
                setNoteContent('');
                setNoteCategory('other');
                setNoteTags('');
                setNotePublic(false);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveNote}>
                {editingNoteId ? "Save Changes" : "Add Note"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Session Modal */}
        <Modal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setEditingSessionId(null);
            setSessionTitle('');
            setSessionSummary('');
            setSessionXP(0);
          }}
          title={editingSessionId ? "Edit Session" : "Add Session"}
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Session Title"
              placeholder="The Quest Begins"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
            />

            <Input
              type="date"
              label="Date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Summary
              </label>
              <textarea
                value={sessionSummary}
                onChange={(e) => setSessionSummary(e.target.value)}
                placeholder="What happened in this session..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[120px]"
              />
            </div>

            <Input
              type="number"
              label="XP Awarded"
              value={sessionXP}
              onChange={(e) => setSessionXP(parseInt(e.target.value) || 0)}
              min={0}
            />

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowSessionModal(false);
                setEditingSessionId(null);
                setSessionTitle('');
                setSessionSummary('');
                setSessionXP(0);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveSession}>
                {editingSessionId ? "Save Changes" : "Add Session"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit NPC Modal */}
        <Modal
          isOpen={showNPCModal}
          onClose={() => {
            setShowNPCModal(false);
            setEditingNPCId(null);
            setNpcName('');
            setNpcRace('');
            setNpcOccupation('');
            setNpcLocation('');
            setNpcDescription('');
            setNpcRelationship('neutral');
            setNpcNotes('');
            setNpcPublic(false);
          }}
          title={editingNPCId ? "Edit NPC" : "Add NPC"}
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Name"
              placeholder="NPC Name"
              value={npcName}
              onChange={(e) => setNpcName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Race"
                placeholder="Human"
                value={npcRace}
                onChange={(e) => setNpcRace(e.target.value)}
              />
              <Input
                type="text"
                label="Occupation"
                placeholder="Merchant"
                value={npcOccupation}
                onChange={(e) => setNpcOccupation(e.target.value)}
              />
            </div>

            <Input
              type="text"
              label="Location"
              placeholder="Waterdeep"
              value={npcLocation}
              onChange={(e) => setNpcLocation(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Relationship
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['ally', 'neutral', 'enemy', 'unknown'] as const).map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setNpcRelationship(rel)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      npcRelationship === rel
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Description
              </label>
              <textarea
                value={npcDescription}
                onChange={(e) => setNpcDescription(e.target.value)}
                placeholder="Physical appearance and personality..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Notes
              </label>
              <textarea
                value={npcNotes}
                onChange={(e) => setNpcNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[60px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="npc-public"
                checked={npcPublic}
                onChange={(e) => setNpcPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="npc-public" className="text-sm text-[#fafafa]">
                Visible to players
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowNPCModal(false);
                setEditingNPCId(null);
                setNpcName('');
                setNpcRace('');
                setNpcOccupation('');
                setNpcLocation('');
                setNpcDescription('');
                setNpcRelationship('neutral');
                setNpcNotes('');
                setNpcPublic(false);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveNPC}>
                {editingNPCId ? "Save Changes" : "Add NPC"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Location Modal */}
        <Modal
          isOpen={showLocationModal}
          onClose={() => {
            setShowLocationModal(false);
            setEditingLocationId(null);
            setLocationName('');
            setLocationType('town');
            setLocationDescription('');
            setLocationPopulation('');
            setLocationPublic(false);
          }}
          title={editingLocationId ? "Edit Location" : "Add Location"}
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Name"
              placeholder="Location Name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['city', 'town', 'village', 'dungeon', 'wilderness', 'building', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setLocationType(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      locationType === type
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              label="Population"
              placeholder="e.g., ~5,000 or Small"
              value={locationPopulation}
              onChange={(e) => setLocationPopulation(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Description
              </label>
              <textarea
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="Describe the location..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="location-public"
                checked={locationPublic}
                onChange={(e) => setLocationPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="location-public" className="text-sm text-[#fafafa]">
                Visible to players
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowLocationModal(false);
                setEditingLocationId(null);
                setLocationName('');
                setLocationType('town');
                setLocationDescription('');
                setLocationPopulation('');
                setLocationPublic(false);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveLocation}>
                {editingLocationId ? "Save Changes" : "Add Location"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Quest Modal */}
        <Modal
          isOpen={showQuestModal}
          onClose={() => {
            setShowQuestModal(false);
            setEditingQuestId(null);
            setQuestTitle('');
            setQuestDescription('');
            setQuestGiver('');
            setQuestStatus('available');
            setQuestPriority('medium');
            setQuestRewards('');
            setQuestPublic(false);
          }}
          title={editingQuestId ? "Edit Quest" : "Add Quest"}
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Title"
              placeholder="Quest Title"
              value={questTitle}
              onChange={(e) => setQuestTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['available', 'active', 'completed', 'failed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setQuestStatus(status)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        questStatus === status
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setQuestPriority(priority)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        questPriority === priority
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Input
              type="text"
              label="Quest Giver"
              placeholder="NPC Name"
              value={questGiver}
              onChange={(e) => setQuestGiver(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Description
              </label>
              <textarea
                value={questDescription}
                onChange={(e) => setQuestDescription(e.target.value)}
                placeholder="Quest details and objectives..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[100px]"
              />
            </div>

            <Input
              type="text"
              label="Rewards (comma-separated)"
              placeholder="100 gold, magic sword, experience"
              value={questRewards}
              onChange={(e) => setQuestRewards(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="quest-public"
                checked={questPublic}
                onChange={(e) => setQuestPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="quest-public" className="text-sm text-[#fafafa]">
                Visible to players
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowQuestModal(false);
                setEditingQuestId(null);
                setQuestTitle('');
                setQuestDescription('');
                setQuestGiver('');
                setQuestStatus('available');
                setQuestPriority('medium');
                setQuestRewards('');
                setQuestPublic(false);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveQuest}>
                {editingQuestId ? "Save Changes" : "Add Quest"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Character to Campaign Modal */}
        <Modal
          isOpen={showAddCharacterModal}
          onClose={() => {
            setShowAddCharacterModal(false);
            setSelectedCharacterId('');
          }}
          title="Add Character to Campaign"
        >
          <div className="space-y-4">
            {availableCharacters.length === 0 ? (
              <div className="text-center py-8 text-[#a1a1aa]">
                <div className="text-4xl mb-2">👤</div>
                <p className="text-sm">No available characters</p>
                <p className="text-xs mt-2">All your characters are already in campaigns or you need to create one first</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[#fafafa] mb-2">
                  Select Character
                </label>
                <div className="space-y-2">
                  {availableCharacters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharacterId(char.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCharacterId === char.id
                          ? 'bg-[#8b5cf6] text-white'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      <div className="font-semibold">{char.name}</div>
                      <div className="text-sm">
                        Level {char.level} {char.race} {char.classes.map((c) => c.name).join('/')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setShowAddCharacterModal(false);
                setSelectedCharacterId('');
              }}>
                Cancel
              </Button>
              {availableCharacters.length > 0 && (
                <Button
                  variant="primary"
                  onClick={addCharacterToCampaign}
                  disabled={!selectedCharacterId}
                >
                  Add Character
                </Button>
              )}
            </div>
          </div>
        </Modal>

        {/* Edit Campaign Modal */}
        <Modal
          isOpen={showEditCampaignModal}
          onClose={() => {
            setShowEditCampaignModal(false);
          }}
          title="Edit Campaign"
        >
          <div className="space-y-4">
            <Input
              type="text"
              label="Campaign Name"
              placeholder="Campaign Name"
              value={editCampaignName}
              onChange={(e) => setEditCampaignName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Description
              </label>
              <textarea
                value={editCampaignDescription}
                onChange={(e) => setEditCampaignDescription(e.target.value)}
                placeholder="Campaign description..."
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[100px]"
              />
            </div>

            <Input
              type="text"
              label="Setting"
              placeholder="Forgotten Realms, Eberron, Custom..."
              value={editCampaignSetting}
              onChange={(e) => setEditCampaignSetting(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Edition
              </label>
              <div className="flex gap-2">
                {(['5e', '2024'] as const).map((ed) => (
                  <button
                    key={ed}
                    onClick={() => setEditCampaignEdition(ed)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      editCampaignEdition === ed
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    D&D {ed}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'normal', 'hard', 'deadly'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setEditCampaignDifficulty(diff)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      editCampaignDifficulty === diff
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#fafafa] mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['planning', 'active', 'on-hold', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setEditCampaignStatus(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      editCampaignStatus === status
                        ? 'bg-[#8b5cf6] text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {status === 'on-hold' ? 'On Hold' : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowEditCampaignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveCampaignEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
