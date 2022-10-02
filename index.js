import Stats from './libs/stats.module.js'

let camera;
let renderer;
let scene;
let vehicle;

function init() {

      let scene = new THREE.Scene();
      // let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 8000)
      /*
      camera.position.z = 5;
      camera.position.y = 10
      */
      let renderer = new THREE.WebGLRenderer({ antialiasing: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);


      let controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;

      let stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);

      const directionalLight = new THREE.DirectionalLight(0xfbe96e, 0.8);
      directionalLight.position.set(0, 20, 0);
      scene.add(directionalLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      scene.background = new THREE.Color('white');

      let carLoader = new THREE.MTLLoader();
      carLoader.setResourcePath('assets/cars/');
      carLoader.setPath('assets/cars/');

      let carObject;

      carLoader.load('model.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('assets/cars/');
            objLoader.load('model.obj', function (object) {
                  carObject = object;
                  scene.add(carObject);
                  //console.log(carObject);                  
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
                  //scene.add(wheelObject_2);
                  //scene.add(wheelObject_3);
                  //console.log(wheelObject_0);                  
            });
      });



      //scene.add(car.seat);

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



      camera.position.set(0, 8, 140);


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
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      //const material = new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.6 });
      const materialCube = new THREE.MeshPhongMaterial({ color: 'blue' });
      const cube = new THREE.Mesh(geometry, materialCube);
      cube.position.set(0, 5, 110);
      //scene.add(cube);

      //sphere
      const sphereGeometry = new THREE.SphereGeometry(1, 100, 100)
      const material2 = new THREE.MeshPhongMaterial({ color: 'green' });
      const sphere = new THREE.Mesh(sphereGeometry, material2);
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
      const world = new CANNON.World();

      world.gravity.set(0, -9.8, 0) // Задаём гравитацию

      world.broadphase = new CANNON.SAPBroadphase(world);
      world.defaultContactMaterial.friction = 0;

      //plane

      const groundMaterial = new CANNON.Material();
      let groundBody = new CANNON.Body({
            mass: 0,
            material: groundMaterial
      }) //Создаём тело
      let groundShape = new CANNON.Plane(1000, 1000)
      groundBody.addShape(groundShape)
      groundBody.position.set(0, 0, 0);
      groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
      world.addBody(groundBody)


      const mass = 100;
      const materialBody = new CANNON.Material();

      // box
      const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      const boxBody = new CANNON.Body({
            mass: mass,
            material: materialBody
      });
      boxBody.addShape(boxShape);
      boxBody.position.set(5, 5, 110);
      boxBody.linearDamping = 0.01;
      // world.addBody(boxBody);


      // sphere
      let sphereBody = new CANNON.Body({
            mass: mass,
            material: materialBody
      });
      let sphereShape = new CANNON.Sphere(1);
      sphereBody.addShape(sphereShape);
      sphereBody.position.set(5, 8, 111.5);
      // world.addBody(sphereBody);

      // const material_ground = new CANNON.ContactMaterial(groundMaterial, materialBody, { friction: 0.3, restitution: 0.1 });
      // world.addContactMaterial(material_ground);

      // CannonDebugRenderer 
      let cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world) //Подцветка скелетов


      // Add cannon car
      const chassisShape = new CANNON.Box(new CANNON.Vec3(0.8, 0.5, 2));
      const chassisBody = new CANNON.Body({ mass: 150 });
      chassisBody.addShape(chassisShape);
      //chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      chassisBody.position.set(0, 2, 100);

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

      const axlewidth = 0.8;

      // forward Wheels
      options.chassisConnectionPointLocal.set(axlewidth, 0, -1.18);
      vehicle.addWheel(options);

      options.chassisConnectionPointLocal.set(-axlewidth, 0, -1.18);
      vehicle.addWheel(options);

      options.chassisConnectionPointLocal.set(axlewidth, 0, 1.4);
      vehicle.addWheel(options);

      options.chassisConnectionPointLocal.set(-axlewidth, 0, 1.4);
      vehicle.addWheel(options);

      vehicle.addToWorld(world);

      const wheelMaterial = new CANNON.Material("wheelMaterial");
      const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
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
            const cylinderShape = new CANNON.Cylinder(wheelRadius, wheelRadius, wheelRadius / 2, 20);
            const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
            const q = new CANNON.Quaternion();
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
            //console.log(wheelBodies[0].position.x);
      });

      document.onkeydown = handler;
      document.onkeyup = handler;

      let maxSteerVal = 0.5;
      let maxForce = 1000;
      let brakeForce = 1000000;
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

                  case 66: // b
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
      }

      function carMovement() {
            if (typeof carObject !== 'undefined') {
                  carObject.position.z = chassisBody.position.z;
                  carObject.position.y = chassisBody.position.y;
                  carObject.position.x = chassisBody.position.x - 0.34;

                  carObject.quaternion.z = chassisBody.quaternion.z
                  carObject.quaternion.y = chassisBody.quaternion.y
                  carObject.quaternion.x = chassisBody.quaternion.x
                  carObject.quaternion.w = chassisBody.quaternion.w
            }
            if (typeof wheelObject_0 !== 'undefined') {
                  wheelObject_0.position.x = wheelBodies[0].position.x;
                  wheelObject_0.position.y = wheelBodies[0].position.y;
                  wheelObject_0.position.z = wheelBodies[0].position.z;

                  wheelObject_0.quaternion.z = wheelBodies[0].quaternion.z
                  wheelObject_0.quaternion.y = wheelBodies[0].quaternion.y
                  wheelObject_0.quaternion.x = wheelBodies[0].quaternion.x
                  wheelObject_0.quaternion.w = wheelBodies[0].quaternion.w

                  wheelObject_1.position.x = wheelBodies[1].position.x;
                  wheelObject_1.position.y = wheelBodies[1].position.y;
                  wheelObject_1.position.z = wheelBodies[1].position.z;

                  wheelObject_1.quaternion.z = wheelBodies[1].quaternion.z
                  wheelObject_1.quaternion.y = wheelBodies[1].quaternion.y
                  wheelObject_1.quaternion.x = wheelBodies[1].quaternion.x
                  wheelObject_1.quaternion.w = wheelBodies[1].quaternion.w                  

                  //console.log(wheelBodies[0].position.x);
            }
      }

      function itemsMovement() {
            // cube
            cube.position.z = boxBody.position.z;
            cube.position.y = boxBody.position.y;
            cube.position.x = boxBody.position.x;

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
            world.step(1 / 60);

            // car
            carMovement();

            //itemsMovement();
            cannonDebugRenderer.update();
            controls.update();
            renderer.render(scene, camera);
            stats.end();
      };

      animate();
}

init();