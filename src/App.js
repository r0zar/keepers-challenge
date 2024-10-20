import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import { Flex, Box, useFlexSize } from '@react-three/flex'
import { Loader, Line, useAspect, useGLTF, MeshDistortMaterial, Shadow } from '@react-three/drei'
import Effects from './components/Effects'
import Text from './components/Text'
import state from './state'
import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from "@stacks/connect";
import { Pc, PostConditionMode, contractPrincipalCV, noneCV, optionalCVOf, stringAsciiCV } from '@stacks/transactions'
import { StacksMainnet } from '@stacks/network'


const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const appDetails = {
  name: "Charisma Explore",
  icon: "https://charisma.rocks/dmg-logo.gif",
};

function HeightReporter({ onReflow }) {
  const size = useFlexSize()
  useLayoutEffect(() => onReflow && onReflow(...size), [onReflow, size])
  return null
}

function Page({ text, tag, images, textScaleFactor, onReflow, left = false }) {
  const textures = useLoader(THREE.TextureLoader, images)
  const { viewport } = useThree()
  const boxProps = {
    centerAnchor: true,
    grow: 1,
    marginTop: 1,
    marginLeft: left * 1,
    marginRight: !left * 1,
    width: 'auto',
    height: 'auto',
    minWidth: 3,
    minHeight: 3,
    maxWidth: 6,
    maxHeight: 6,
  }
  return (
    <Box dir="column" align={left ? 'flex-start' : 'flex-end'} justify="flex-start" width="100%" height="auto" minHeight="100%">
      <HeightReporter onReflow={onReflow} />
      <Box dir="row" width="100%" height="auto" justify={left ? 'flex-end' : 'flex-start'} margin={0} grow={1} wrap="wrap">
        {textures.map((texture, index) => (
          <Box key={index} {...boxProps}>
            {(width, height) => (
              <mesh>
                <planeBufferGeometry args={[width, height]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
              </mesh>
            )}
          </Box>
        ))}
      </Box>
      <Box marginLeft={1.5} marginRight={1.5} marginTop={2}>
        <Text position={[left ? 1 : -1, 0.5, 1]} fontSize={textScaleFactor} lineHeight={1} letterSpacing={-0.05} maxWidth={(viewport.width / 4) * 3}>
          {tag}
          <meshBasicMaterial color="#999999" toneMapped={false} />
        </Text>
      </Box>
      <Box marginLeft={left ? 1.5 : 1} marginRight={left ? 1 : 1.5} marginBottom={1}>
        <Text
          bold
          position-z={0.5}
          textAlign={left ? 'left' : 'right'}
          fontSize={1.5 * textScaleFactor}
          lineHeight={1}
          letterSpacing={-0.05}
          color="white"
          maxWidth={(viewport.width / 4) * 3}>
          {text}
        </Text>
      </Box>
    </Box>
  )
}

function Layercard({ depth, boxWidth, boxHeight, text, textColor, color, map, textScaleFactor }) {
  const ref = useRef()
  const { viewport, size } = useThree()
  const pageLerp = useRef(state.top / size.height)
  useFrame(() => {
    const page = (pageLerp.current = THREE.MathUtils.lerp(pageLerp.current, state.top / size.height, 0.15))
    if (depth >= 0) ref.current.opacity = page < state.threshold * 1.7 ? 0.9 : 0.9 - (page - state.threshold * 1.7)
  })
  return (
    <>
      <mesh position={[boxWidth / 2, -boxHeight / 2, depth]}>
        <planeBufferGeometry args={[boxWidth, boxHeight]} />
        <meshBasicMaterial ref={ref} color={color} map={map} toneMapped={false} transparent opacity={1} />
      </mesh>
      <Text
        bold
        position={[boxWidth / 2, -boxHeight / 2, depth + 1.5]}
        maxWidth={(viewport.width / 4) * 1}
        anchorX="center"
        anchorY="middle"
        fontSize={0.6 * textScaleFactor}
        lineHeight={1}
        letterSpacing={-0.05}
        color={textColor || "white"}>
        {text}
      </Text>
    </>
  )
}

function Content({ onReflow }) {
  const group = useRef()
  const { viewport, size } = useThree()
  const [bW, bH] = useAspect(1920, 1920, 0.5)
  const texture = useLoader(THREE.TextureLoader, state.depthbox[0].image)
  const vec = new THREE.Vector3()
  const pageLerp = useRef(state.top / size.height)
  useFrame(() => {
    const page = (pageLerp.current = THREE.MathUtils.lerp(pageLerp.current, state.top / size.height, 0.15))
    const y = page * viewport.height
    const sticky = state.threshold * viewport.height
    group.current.position.lerp(vec.set(0, page < state.threshold ? y : sticky, page < state.threshold ? 0 : page * 1.25), 0.15)
  })
  const handleReflow = useCallback((w, h) => onReflow((state.pages = h / viewport.height + 5.5)), [onReflow, viewport.height])
  const sizesRef = useRef([])
  const scale = Math.min(1, viewport.width / 16)
  return (
    <group ref={group}>
      <Flex dir="column" position={[-viewport.width / 2, viewport.height / 2, 0]} size={[viewport.width, viewport.height, 0]} onReflow={handleReflow}>
        {state.content.map((props, index) => (
          <Page
            key={index}
            left={!(index % 2)}
            textScaleFactor={scale}
            onReflow={(w, h) => {
              sizesRef.current[index] = h
              state.threshold = Math.max(4, (4 / (15.8 * 3)) * sizesRef.current.reduce((acc, e) => acc + e, 0))
            }}
            {...props}
          />
        ))}
        <Box dir="row" width="100%" height="100%" align="center" justify="center">
          <Box centerAnchor>
            {state.lines.map((props, index) => (
              <Line key={index} {...props} color="white" />
            ))}
            <Text
              bold
              position-z={0.5}
              anchorX="center"
              anchorY="middle"
              fontSize={1.5 * scale}
              lineHeight={1}
              letterSpacing={-0.05}
              color="white"
              maxWidth={(viewport.width / 4) * 3}>
              {state.depthbox[0].text}
            </Text>
          </Box>
        </Box>
        <Box dir="row" width="100%" height="100%" align="center" justify="center">
          <Box>
            <Layercard {...state.depthbox[0]} text={state.depthbox[1].text} boxWidth={bW} boxHeight={bH} map={texture} textScaleFactor={scale} />
            <Model position={[bW / 2, -bH / 2, state.depthbox[1].depth]} />
          </Box>
        </Box>
      </Flex>
    </group>
  )
}

export default function App() {
  const scrollArea = useRef()
  const canvasRef = useRef()
  const [allowCanvasPointerEvents, setAllowCanvasPointerEvents] = useState(false)
  const onScroll = (e) => {
    state.top = e.target.scrollTop
    
    // Check if we've reached the end of the scroll
    const isAtBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 1
    pages !== 0 && setAllowCanvasPointerEvents(isAtBottom)
  }
  
  useEffect(() => void onScroll({ target: scrollArea.current }), [])
  const [pages, setPages] = useState(0)

  const handleWheel = (e) => {
    if (!allowCanvasPointerEvents) {
      scrollArea.current.scrollTop += e.deltaY;
    }
  }

  const handlePointerMove = (e) => {
    const canvasBounds = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1
    const y = -((e.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
    state.mouse = [x, y]
  }

  return (
    <>
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], far: 1000 }}
        gl={{ powerPreference: 'high-performance', alpha: false, antialias: false, stencil: false, depth: false }}
        onCreated={({ gl }) => gl.setClearColor('#000000')}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        onWheel={handleWheel}
        onPointerMove={handlePointerMove}
      >
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <ambientLight intensity={0.4} />
        <spotLight
          castShadow
          angle={0.3}
          penumbra={1}
          position={[0, 10, 20]}
          intensity={5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <Content onReflow={setPages} />
        </Suspense>
        <Effects />
      </Canvas>
      <div
        className="scrollArea"
        ref={scrollArea}
        onScroll={onScroll}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          pointerEvents: allowCanvasPointerEvents ? 'none' : 'auto',
        }}
      >
        <div style={{ height: `${pages * 100}vh` }} />
      </div>
      <Loader />
      </>
  )
}

function ActionShape({ position, color, hoverColor, action, onSelect, distortFactor, speed = 1, onHover }) {
  const [hovered, setHovered] = useState(false)
  const group = useRef()
  const { nodes } = useGLTF('/geo.min.glb', true)
  const { gl } = useThree()

  useFrame(({ clock }) => {
    const t = (1 + Math.sin(clock.getElapsedTime() * 1.5 * speed + position[0])) / 2
    group.current.position.y = t / 5
    const rotationSpeed = hovered ? 0.01 : 0.005
    group.current.rotation.x += rotationSpeed * speed
    group.current.rotation.z += rotationSpeed * speed
    
    const baseScale = 0.4
    const hoverScale = hovered ? baseScale * 1.1 : baseScale
    group.current.scale.set(hoverScale, hoverScale, hoverScale)
  })

  return (
    <group>
      <group ref={group} position={position}>
        <mesh
          geometry={nodes.geo.geometry}
          onPointerOver={(e) => {
            setHovered(true)
            gl.domElement.style.cursor = action === 'Heist' ? 'not-allowed' : 'pointer'
            onHover(action)
          }}
          onPointerOut={(e) => {
            setHovered(false)
            gl.domElement.style.cursor = 'auto'
            onHover('')
          }}
          onClick={(e) => {
            e.stopPropagation()
            action !== 'Heist' && onSelect(action)
          }}>
          <MeshDistortMaterial 
            color={hovered ? hoverColor : color} 
            flatShading 
            roughness={1} 
            metalness={0.5} 
            factor={distortFactor} 
            speed={5 * speed} 
          />
        </mesh>
        <mesh geometry={nodes.geo.geometry}>
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </group>
    </group>
  )
}

function Model(props) {
  const shadow = useRef()
  const [hovered, setHovered] = useState('')
  const [selected, setSelected] = useState('')

  const handleActionSelect = async (action) => {
    console.log(`Selected action: ${action}`)
    setSelected(action)

    const useData = userSession.isUserSignedIn() && userSession.loadUserData()

    console.log(action.toUpperCase())
    !userSession.isUserSignedIn() && showConnect({
      appDetails,
      userSession,
    })

    const postConditions = [
      Pc.principal(useData.profile.stxAddress.mainnet).willSendGte(1).ft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy','energy'),
      Pc.principal(useData.profile.stxAddress.mainnet).willSendGte(1).ft('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token','charisma'),
    ]

    if (action === 'Petition' || action === 'Challenge') {
      postConditions.push(Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS').willSendGte(2500000).ft('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token','charisma'))
    }
    
    userSession.isUserSignedIn() && openContractCall({
      userSession: userSession,
      network: new StacksMainnet(),
      contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      contractName: 'dungeon-crawler-rc4',
      functionName: 'explore',
      functionArgs: [
        optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-cha-rc3')), 
        optionalCVOf(stringAsciiCV("TAP")),
        optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-iouwelsh-rc1')), 
        optionalCVOf(stringAsciiCV("TAP")),
        optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-iouroo-rc1')), 
        optionalCVOf(stringAsciiCV("TAP")),
        optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'keepers-challenge-rc3')), 
        optionalCVOf(stringAsciiCV(action.toUpperCase())),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'keepers-challenge-rc3')), 
        // optionalCVOf(stringAsciiCV(action.toUpperCase())),
        optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'hot-potato-rc1')), 
        optionalCVOf(stringAsciiCV("PASS")),
        // noneCV(),
        // noneCV(),
        // noneCV(),
        // noneCV(),
        // noneCV(),
        // noneCV(),
        noneCV(),
        noneCV(),
        noneCV(),
        noneCV(),
        noneCV(),
        noneCV(),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'kraken-arbitrage-rc1')), 
        // optionalCVOf(stringAsciiCV("STRW1")),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'kraken-arbitrage-rc1')), 
        // optionalCVOf(stringAsciiCV("STRW2")),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'kraken-arbitrage-rc1')), 
        // optionalCVOf(stringAsciiCV("STRR1")),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'kraken-arbitrage-rc1')), 
        // optionalCVOf(stringAsciiCV("STRR2")),
        // optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'charisma-mine-rc1')), 
        // optionalCVOf(stringAsciiCV("WRAP")),
      ],
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      onFinish: data => {
        console.log('Contract call successful', data);
      },
      onCancel: () => {
        console.log('Contract call canceled');
      }
    });
  }

  const handleActionHover = (action) => {
    setHovered(action)
  }

  return (
    <group {...props} dispose={null}>
      <group position={[0.05, -0.6, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.07} lineHeight={1} letterSpacing={-0.05}>
          <meshBasicMaterial color="#cccccc" toneMapped={false} />
        </Text>
        <Text bold position={[-0.01, -0.1, 0]} fontSize={0.1} lineHeight={1} letterSpacing={-0.05} color="white">
          {`Keeper's Challenge\nThe First Interaction`}
        </Text>
      </group>
      <group position={[0, -1, 0]}>
        <Text bold position={[0, 2.5, 0]} fontSize={0.5} lineHeight={1} letterSpacing={-0.05} color="white" anchorX="center" anchorY="middle">
          {hovered || selected}
        </Text>
      </group>
      <Shadow ref={shadow} opacity={0.3} rotation-x={-Math.PI / 2} position={[0, -1.51, 0]} />

      {/* Action Shapes */}
      <ActionShape 
        position={[-1, 0, 0]} 
        color="#c1121f" 
        hoverColor="#8B000099" 
        action="Petition" 
        onSelect={handleActionSelect} 
        onHover={handleActionHover}
        distortFactor={5} 
        speed={1} 
      />
      <ActionShape 
        position={[0, 0, 0]} 
        color="#B22222" 
        hoverColor="#c1121f69" 
        action="Challenge" 
        onSelect={handleActionSelect} 
        onHover={handleActionHover}
        distortFactor={15} 
        speed={1.5} 
      />
      <ActionShape 
        position={[1, 0, 0]} 
        color="#c1121f" 
        hoverColor="#c1121f11" 
        action="Heist" 
        onSelect={handleActionSelect} 
        onHover={handleActionHover}
        distortFactor={25} 
        speed={2.5} 
      />
    </group>
  )
}