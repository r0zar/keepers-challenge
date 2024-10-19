import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshDistortMaterial, Shadow, Billboard } from '@react-three/drei'
import Text from './Text'
import state from '../state'

function ActionShape({ position, color, hoverColor, action, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const group = useRef()
  const { nodes } = useGLTF('/geo.min.glb', true)

  useFrame(({ clock }) => {
    const t = (1 + Math.sin(clock.getElapsedTime() * 1.5 + position[0])) / 2
    group.current.position.y = t / 5
    group.current.rotation.x = group.current.rotation.z += 0.005
  })

  return (
    <group>
      <group ref={group} position={position} scale={[0.4, 0.4, 0.4]}>
        <mesh
          geometry={nodes.geo.geometry}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelect(action)}>
          <MeshDistortMaterial color={hovered ? hoverColor : color} flatShading roughness={1} metalness={0.5} factor={15} speed={5} />
        </mesh>
        <mesh geometry={nodes.geo.geometry}>
          <meshBasicMaterial wireframe />
        </mesh>
      </group>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={[position[0], position[1] - 1, position[2]]}>
        <Text fontSize={0.2} color="black" anchorX="center" anchorY="middle" renderOrder={1}>
          {action}
        </Text>
      </Billboard>
    </group>
  )
}

export default function Model(props) {
  const shadow = useRef()

  const handleActionSelect = (action) => {
    console.log(`Selected action: ${action}`)
    // Here you can add logic to execute the selected action
  }

  return (
    <group {...props} dispose={null}>
      <group position={[1.25, -0.5, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.07} lineHeight={1} letterSpacing={-0.05}>
          03
          <meshBasicMaterial color="#cccccc" toneMapped={false} />
        </Text>
        <Text bold position={[-0.01, -0.1, 0]} fontSize={0.1} lineHeight={1} letterSpacing={-0.05} color="black">
          {`Keeper's Challenge\nThe First Interaction`}
        </Text>
      </group>
      <Shadow ref={shadow} opacity={0.3} rotation-x={-Math.PI / 2} position={[0, -1.51, 0]} />

      {/* Action Shapes */}
      <ActionShape position={[-2, 0, 0]} color="#4285F4" hoverColor="#5C9FFF" action="Petition" onSelect={handleActionSelect} />
      <ActionShape position={[0, 0, 0]} color="#34A853" hoverColor="#46C46A" action="Challenge" onSelect={handleActionSelect} />
      <ActionShape position={[2, 0, 0]} color="#EA4335" hoverColor="#FF5A4D" action="Heist" onSelect={handleActionSelect} />
    </group>
  )
}
