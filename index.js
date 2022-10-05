import Stats from './libs/stats.module.js'

let camera;
let renderer;
let scene;
let vehicle;
let controls;
let worldStep = 1 / 60;
let controlsDisable = false;

function init() {

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000)

      renderer = new THREE.WebGLRenderer({ antialiasing: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      if (controlsDisable) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;
      }
      let stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);

      let directionalLight = new THREE.DirectionalLight(0xfbe96e, 0.8);
      directionalLight.position.set(0, 20, 0);
      scene.add(directionalLight);

      let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      scene.background = new THREE.Color('white');

      let carLoader = new THREE.MTLLoader();
      carLoader.setResourcePath('assets/cars/');
      carLoader.setPath('assets/cars/');

      let carObject;
      let followCam = new THREE.Object3D();

      carLoader.load('model.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/cars/');
            objLoader.load('model.obj', function (object) {
                  followCam.parent = object;
                  carObject = object;
                  scene.add(carObject);
            });
      });

      let wheelLoader = new THREE.MTLLoader();
      wheelLoader.setResourcePath('assets/wheel/');
      wheelLoader.setPath('assets/wheel/');

      let wheelObject_0;
      let wheelObject_1;
      let wheelObject_2;
      let wheelObject_3;

      wheelLoader.load('wheel.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/wheel/');
            objLoader.load('wheel.obj', function (object) {
                  wheelObject_0 = object;
                  scene.add(wheelObject_0);
                  wheelObject_1 = wheelObject_0.clone();
                  scene.add(wheelObject_1);
            });
      });


      let wheelLoader_2 = new THREE.MTLLoader();
      wheelLoader_2.setResourcePath('assets/wheel/');
      wheelLoader_2.setPath('assets/wheel/');

      wheelLoader_2.load('wheel.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/wheel/');
            objLoader.load('wheel_2.obj', function (object) {
                  wheelObject_2 = object;
                  scene.add(wheelObject_2);
                  wheelObject_3 = wheelObject_2.clone();
                  scene.add(wheelObject_3);
            });
      });


      /*
      
      mtlLoader3.setResourcePath('assets/cars/');
      mtlLoader3.setPath('assets/cars/');

      mtlLoader3.load('1967-cars.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/cars/');
            objLoader.load('mustang4.obj', function (object) {
                  object.position.x = 13.6;
                  object.position.y = 6;
                  object.position.z = 100;
                  object.rotation.y = Math.PI;
                  scene.add(object);
            });
      });
      */


      if (!controlsDisable) {
            camera.position.set(0, 3.8, 4.3);
      } else {
            camera.position.set(40, 24, 160);
      }


      let trackLoader = new THREE.MTLLoader();
      trackLoader.setResourcePath('assets/track/');
      trackLoader.setPath('assets/track/');

      trackLoader.load('track.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/track/');
            objLoader.load('track.obj', function (object) {
                  object.position.y = 2;
                  scene.add(object);
            });
      });

      /* Debug Geometry */
      let geometry = new THREE.BoxGeometry(2, 2, 2);
      //let material = new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.6 });
      let materialCube = new THREE.MeshPhongMaterial({ color: 'blue' });
      let cube = new THREE.Mesh(geometry, materialCube);
      cube.position.set(0, 5, 110);
      //scene.add(cube);

      //sphere
      let sphereGeometry = new THREE.SphereGeometry(1, 100, 100)
      let material2 = new THREE.MeshPhongMaterial({ color: 'green' });
      let sphere = new THREE.Mesh(sphereGeometry, material2);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      //scene.add(sphere);


      window.addEventListener('resize', function () { onWindowResize(); }, false);

      function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
      }

      /*CANNON */
      let world = new CANNON.World();

      world.gravity.set(0, -9.8, 0) // Задаём гравитацию

      world.broadphase = new CANNON.SAPBroadphase(world);
      world.defaultContactMaterial.friction = 0;

      //plane

     
      let groundMaterial = new CANNON.Material();
      let groundBody = new CANNON.Body({
            mass: 0,
            material: groundMaterial
      }) 
      let groundShape = new CANNON.Plane(1000, 1000)
      groundBody.addShape(groundShape)
      groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
      groundBody.position.set(0, -20, 0);
      world.addBody(groundBody)
      

      // box
      let materialBody = new CANNON.Material();
      let boxShape = new CANNON.Box(new CANNON.Vec3(26.5, 0.01, 12));
      let springboardShape = new CANNON.Box(new CANNON.Vec3(2, 0.01, 4));


      let boxBody_1 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_1.addShape(boxShape);
      boxBody_1.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 20);
      boxBody_1.position.set(0, 0, 119);
      world.addBody(boxBody_1);

      let boxBody_2 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_2.addShape(boxShape);
      boxBody_2.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 20);
      boxBody_2.position.set(22, 0, 118.8);
      world.addBody(boxBody_2);

      let boxBody_3 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_3.addShape(boxShape);
      boxBody_3.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 5.5);
      boxBody_3.position.set(40, 0, 112);
      world.addBody(boxBody_3);

      let boxBody_4 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_4.addShape(boxShape);
      boxBody_4.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      boxBody_4.position.set(55, 0, 85);
      world.addBody(boxBody_4);

      let boxBody_5 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_5.addShape(boxShape);
      boxBody_5.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      boxBody_5.position.set(55, 0.2, 22);
      world.addBody(boxBody_5);     
      
      let boxBody_6 = new CANNON.Body({
            mass: 0,
            material: materialBody
      });
      boxBody_6.addShape(springboardShape);
      boxBody_6.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 13);
      boxBody_6.position.set(50.5, 0, 61);
      world.addBody(boxBody_6);   


      // sphere
      /*
      let sphereBody = new CANNON.Body({
            mass: mass,
            material: materialBody
      });
      let sphereShape = new CANNON.Sphere(1);
      sphereBody.addShape(sphereShape);
      sphereBody.position.set(5, 8, 111.5);
      world.addBody(sphereBody);

      let material_ground = new CANNON.ContactMaterial(groundMaterial, materialBody, { friction: 0.3, restitution: 0.1 });
      world.addContactMaterial(material_ground);
      */

      // CannonDebugRenderer 
      let cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world) //Подцветка скелетов


      // Add cannon car
      let chassisShape = new CANNON.Box(new CANNON.Vec3(0.8, 0.5, 2));
      let chassisBody = new CANNON.Body({ mass: 150 });
      chassisBody.addShape(chassisShape);
      chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 3 * Math.PI / 2);
      chassisBody.position.set(0, 2, 120);

      followCam.position.copy(camera.position);
      scene.add(followCam);

      let options = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.2,
            frictionSlip: 2,
            dampingRelaxation: 1.3,
            dampingCompression: 2.4,
            maxSuspensionForce: 200000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
      };

      // Create the vehicle
      vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indeForwardAxis: 2
      });

      let axlewidth = 0.685;

      // forward Wheels
      options.chassisConnectionPointLocal.set(axlewidth, 0, -1.31);
      vehicle.addWheel(options);

      options.chassisConnectionPointLocal.set(-axlewidth, 0, -1.31);
      vehicle.addWheel(options);

      // back Wheels
      options.chassisConnectionPointLocal.set(axlewidth, 0, 1.22);
      vehicle.addWheel(options);

      options.chassisConnectionPointLocal.set(-axlewidth, 0, 1.22);
      vehicle.addWheel(options);

      vehicle.addToWorld(world);

      let wheelMaterial = new CANNON.Material("wheelMaterial");
      let wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, materialBody, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000
      });

      // We must add the contact materials to the world
      world.addContactMaterial(wheelGroundContactMaterial);

      let wheelBodies = [];
      let wheelRadius = 0.31;
      for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            let wheel = vehicle.wheelInfos[i];
            let cylinderShape = new CANNON.Cylinder(wheelRadius, wheelRadius, wheelRadius / 2, 20);
            let wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
            let q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
            wheelBodies.push(wheelBody);
            world.addBody(wheelBody);
      }

      // Update wheels
      world.addEventListener('postStep', function () {
            for (let i = 0; i < vehicle.wheelInfos.length; i++) {
                  vehicle.updateWheelTransform(i);
                  let t = vehicle.wheelInfos[i].worldTransform;
                  let wheelBody = wheelBodies[i];
                  wheelBody.position.copy(t.position);
                  wheelBody.quaternion.copy(t.quaternion);
            }
      });

      document.onkeydown = handler;
      document.onkeyup = handler;

      let maxSteerVal = 0.5;
      let maxForce = 1000;
      let brakeForce = 2;

      function handler(event) {
            let up = (event.type == 'keyup');

            if (!up && event.type !== 'keydown') {
                  return;
            }
            vehicle.setBrake(0, 0);
            vehicle.setBrake(0, 1);
            vehicle.setBrake(0, 2);
            vehicle.setBrake(0, 3);
            switch (event.keyCode) {
                  case 38: // forward
                        vehicle.applyEngineForce(up ? 0 : maxForce, 2);
                        vehicle.applyEngineForce(up ? 0 : maxForce, 3);
                        break;

                  case 40: // backward
                        vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
                        vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                        break;

                  case 32: // space
                        vehicle.setBrake(brakeForce, 0);
                        vehicle.setBrake(brakeForce, 1);
                        vehicle.setBrake(brakeForce, 2);
                        vehicle.setBrake(brakeForce, 3);
                        break;

                  case 39: // right
                        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
                        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
                        break;

                  case 37: // left
                        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
                        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
                        break;
            }
            if ((event.type == 'keyup')) {
                  vehicle.setBrake(brakeForce, 0);
                  vehicle.setBrake(brakeForce, 1);
                  vehicle.setBrake(brakeForce, 2);
                  vehicle.setBrake(brakeForce, 3);
            }
      }

      function carMovement() {
            if (typeof carObject !== 'undefined') {
                  carObject.position.z = chassisBody.position.z;
                  carObject.position.y = chassisBody.position.y;
                  carObject.position.x = chassisBody.position.x;

                  carObject.quaternion.z = chassisBody.quaternion.z
                  carObject.quaternion.y = chassisBody.quaternion.y
                  carObject.quaternion.x = chassisBody.quaternion.x
                  carObject.quaternion.w = chassisBody.quaternion.w

                  let pos = carObject.position.clone();
                  pos.y += 1.8;
                  if (!controlsDisable) {
                        camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.4);
                        camera.lookAt(pos);
                  }

            }
            if ((typeof wheelObject_0 !== 'undefined') && (typeof wheelObject_1 !== 'undefined') && (typeof wheelObject_2 !== 'undefined') && (typeof wheelObject_3 !== 'undefined')) {
                  wheelObject_0.position.x = wheelBodies[0].position.x;
                  wheelObject_0.position.y = wheelBodies[0].position.y;
                  wheelObject_0.position.z = wheelBodies[0].position.z;

                  wheelObject_0.quaternion.z = wheelBodies[0].quaternion.z;
                  wheelObject_0.quaternion.y = wheelBodies[0].quaternion.y;
                  wheelObject_0.quaternion.x = wheelBodies[0].quaternion.x;
                  wheelObject_0.quaternion.w = wheelBodies[0].quaternion.w;

                  wheelObject_1.position.x = wheelBodies[2].position.x;
                  wheelObject_1.position.y = wheelBodies[2].position.y;
                  wheelObject_1.position.z = wheelBodies[2].position.z;

                  wheelObject_1.quaternion.z = wheelBodies[2].quaternion.z;
                  wheelObject_1.quaternion.y = wheelBodies[2].quaternion.y;
                  wheelObject_1.quaternion.x = wheelBodies[2].quaternion.x;
                  wheelObject_1.quaternion.w = wheelBodies[2].quaternion.w;

                  wheelObject_2.position.x = wheelBodies[1].position.x;
                  wheelObject_2.position.y = wheelBodies[1].position.y;
                  wheelObject_2.position.z = wheelBodies[1].position.z;

                  wheelObject_2.quaternion.z = wheelBodies[1].quaternion.z;
                  wheelObject_2.quaternion.y = wheelBodies[1].quaternion.y;
                  wheelObject_2.quaternion.x = wheelBodies[1].quaternion.x
                  wheelObject_2.quaternion.w = wheelBodies[1].quaternion.w


                  wheelObject_3.position.x = wheelBodies[3].position.x;
                  wheelObject_3.position.y = wheelBodies[3].position.y;
                  wheelObject_3.position.z = wheelBodies[3].position.z;

                  wheelObject_3.quaternion.z = wheelBodies[3].quaternion.z;
                  wheelObject_3.quaternion.y = wheelBodies[3].quaternion.y;
                  wheelObject_3.quaternion.x = wheelBodies[3].quaternion.x;
                  wheelObject_3.quaternion.w = wheelBodies[3].quaternion.w;
            }
      }

      function itemsMovement() {
            // cube
            cube.position.z = boxBody_1.position.z;
            cube.position.y = boxBody_1.position.y;
            cube.position.x = boxBody_1.position.x;

            // sphere
            sphere.position.z = sphereBody.position.z
            sphere.position.y = sphereBody.position.y
            sphere.position.x = sphereBody.position.x

            sphere.quaternion.z = sphereBody.quaternion.z
            sphere.quaternion.y = sphereBody.quaternion.y
            sphere.quaternion.x = sphereBody.quaternion.x
            sphere.quaternion.w = sphereBody.quaternion.w
      }

      let animate = function () {
            requestAnimationFrame(animate);
            stats.begin();
            world.step(worldStep);
            carMovement();
            //itemsMovement();
            //cannonDebugRenderer.update();
            if (controlsDisable) {
                  controls.update();
            }
            renderer.render(scene, camera);
            stats.end();
      };

      animate();
}

init();