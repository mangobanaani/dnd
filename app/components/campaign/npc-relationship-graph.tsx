"use client";

import { useState, useEffect, useRef } from 'react';
import { CampaignNPC } from '@/app/types/campaign';

interface NPCRelationshipGraphProps {
  npcs: CampaignNPC[];
  onNPCClick: (npc: CampaignNPC) => void;
}

interface NPCNode {
  id: string;
  npc: CampaignNPC;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NPCRelationshipGraph({ npcs, onNPCClick }: NPCRelationshipGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NPCNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<NPCNode | null>(null);
  const [filterRelationship, setFilterRelationship] = useState<'all' | 'ally' | 'enemy' | 'neutral'>('all');
  const [selectedNode, setSelectedNode] = useState<NPCNode | null>(null);

  const WIDTH = 800;
  const HEIGHT = 600;
  const NODE_RADIUS = 30;

  // Initialize nodes with random positions
  useEffect(() => {
    const initialNodes: NPCNode[] = npcs.map(npc => ({
      id: npc.id,
      npc,
      x: Math.random() * (WIDTH - 100) + 50,
      y: Math.random() * (HEIGHT - 100) + 50,
      vx: 0,
      vy: 0,
    }));
    setNodes(initialNodes);
  }, [npcs]);

  // Simple force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }));

        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          const nodeA = newNodes[i];

          // Repulsion from other nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            const nodeB = newNodes[j];

            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              const force = (150 - distance) / 150;
              nodeA.vx += (dx / distance) * force * 0.5;
              nodeA.vy += (dy / distance) * force * 0.5;
            }
          }

          // Attraction to center
          const centerX = WIDTH / 2;
          const centerY = HEIGHT / 2;
          const dx = centerX - nodeA.x;
          const dy = centerY - nodeA.y;
          nodeA.vx += dx * 0.001;
          nodeA.vy += dy * 0.001;

          // Apply velocity with damping
          nodeA.vx *= 0.95;
          nodeA.vy *= 0.95;
          nodeA.x += nodeA.vx;
          nodeA.y += nodeA.vy;

          // Keep within bounds
          nodeA.x = Math.max(NODE_RADIUS, Math.min(WIDTH - NODE_RADIUS, nodeA.x));
          nodeA.y = Math.max(NODE_RADIUS, Math.min(HEIGHT - NODE_RADIUS, nodeA.y));
        }

        return newNodes;
      });
    }, 50);

    // Stop after 3 seconds to save CPU
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [nodes.length]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Filter nodes
    const filteredNodes = filterRelationship === 'all'
      ? nodes
      : nodes.filter(n => n.npc.relationship === filterRelationship);

    // Draw connections (based on location)
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let i = 0; i < filteredNodes.length; i++) {
      for (let j = i + 1; j < filteredNodes.length; j++) {
        const nodeA = filteredNodes[i];
        const nodeB = filteredNodes[j];

        // Connect if same location
        if (nodeA.npc.location && nodeA.npc.location === nodeB.npc.location) {
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    filteredNodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

      // Color by relationship
      let fillColor = '#52525b'; // neutral gray
      if (node.npc.relationship === 'ally') fillColor = '#22c55e'; // green
      if (node.npc.relationship === 'enemy') fillColor = '#ef4444'; // red
      if (node.npc.relationship === 'unknown') fillColor = '#a1a1aa'; // light gray

      ctx.fillStyle = isHovered || isSelected ? fillColor : fillColor + '88';
      ctx.fill();

      // Border
      if (isSelected) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#fafafa';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // Status indicator
      if (node.npc.status === 'dead') {
        ctx.fillStyle = '#71717a';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', node.x, node.y);
      }

      // Name label
      ctx.fillStyle = '#fafafa';
      ctx.font = `${isHovered || isSelected ? 'bold ' : ''}10px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.npc.name, node.x, node.y + NODE_RADIUS + 5);
    });
  }, [nodes, hoveredNode, selectedNode, filterRelationship]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS;
    });

    setHoveredNode(hovered || null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < NODE_RADIUS;
    });

    if (clicked) {
      setSelectedNode(clicked);
      onNPCClick(clicked.npc);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#fafafa]">NPC Relationship Map</h2>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['all', 'ally', 'enemy', 'neutral'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setFilterRelationship(filter)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                filterRelationship === filter
                  ? 'bg-[#8b5cf6] text-white'
                  : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
              }`}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="glass rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Legend */}
      <div className="glass-subtle rounded-lg p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
            <span className="text-[#a1a1aa]">Ally</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#52525b]"></div>
            <span className="text-[#a1a1aa]">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
            <span className="text-[#a1a1aa]">Enemy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#a1a1aa]"></div>
            <span className="text-[#a1a1aa]">Unknown</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💀</span>
            <span className="text-[#a1a1aa]">Deceased</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-[#71717a]">
          Lines connect NPCs in the same location. Click a node to view details. Hover to highlight.
        </p>
      </div>

      {/* Selected NPC Details */}
      {selectedNode && (
        <div className="glass-subtle rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[#fafafa] mb-1">
                {selectedNode.npc.name}
              </h3>
              <p className="text-sm text-[#a1a1aa]">
                {selectedNode.npc.race} {selectedNode.npc.occupation && `• ${selectedNode.npc.occupation}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#a1a1aa] hover:text-[#fafafa]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                selectedNode.npc.relationship === 'ally' ? 'bg-green-500/20 text-green-400' :
                selectedNode.npc.relationship === 'enemy' ? 'bg-red-500/20 text-red-400' :
                selectedNode.npc.relationship === 'neutral' ? 'bg-gray-500/20 text-gray-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {selectedNode.npc.relationship}
              </span>
              {selectedNode.npc.location && (
                <span className="px-2 py-1 bg-[#27272a] text-[#a1a1aa] rounded text-xs">
                  📍 {selectedNode.npc.location}
                </span>
              )}
              <span className={`px-2 py-1 rounded text-xs ${
                selectedNode.npc.status === 'alive' ? 'bg-green-500/20 text-green-400' :
                selectedNode.npc.status === 'dead' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {selectedNode.npc.status}
              </span>
            </div>

            {selectedNode.npc.description && (
              <p className="text-[#a1a1aa] text-sm">{selectedNode.npc.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
