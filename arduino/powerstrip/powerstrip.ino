int pinNumber = 8;
String id = "1";
int lpLength = 50;
int vals[50];
int ind = 0;

char inData[20]; // Allocate some space for the string
char inChar=-1; // Where to store the character read
byte index = 0; // Index into array; where to store the character

void setup() {
  pinMode(pinNumber, OUTPUT);      
  Serial.begin(9600);
}

void loop() {
  int i = 0;  
  int x = analogRead(5);

  if (Serial.available() > 0) {
   // read theincoming byte:
    i = Serial.read();
  } else {
  }
  if (ind < lpLength) {
    vals[ind] = x;
    ind = ind + 1;
  } else {
    for (int i=0;i<lpLength-1;i++) {
      vals[i] = vals[i+1];
    }
    vals[lpLength-1] = x;
  }
  
  String on = id+":on";
  String off= id+":off";
  String transmit = id+":tx";  
  if (id.equals("1") && i==97) {
    digitalWrite(pinNumber,HIGH);
    Serial.println(on);
  }
  else if (id.equals("1") && i==98) {
    digitalWrite(pinNumber,LOW);
    Serial.println(off);
  } 
  else if (id.equals("1") && i==99){
    int val = -1;
    for (int i=0;i<lpLength;i++) {
      if (vals[i] > val) {
        val = vals[i];
      }
    }
    float v = (val-512)*2.23296878f;
    String str;
    char buffer[10];
    dtostrf(v,1,2,buffer);
    str = String(buffer);
    Serial.println(id+":"+str);
  }
  
  if (id.equals("2") && i==100) {
    digitalWrite(pinNumber,HIGH);
    Serial.println(on);
  }
  else if (id.equals("2") && i==101) {
    digitalWrite(pinNumber,LOW);
    Serial.println(off);
  } 
  else if (id.equals("2") && i==102){
    int val = -1;
    for (int i=0;i<lpLength;i++) {
      if (vals[i] > val) {
        val = vals[i];
      }
    }
    float v = (val-512)*2.23296878f;
    String str;
    char buffer[10];
    dtostrf(v,1,2,buffer);
    str = String(buffer);
    Serial.println(id+":"+str);
  }
  
  if (id.equals("3") && i==103) {
    digitalWrite(pinNumber,HIGH);
    Serial.println(on);
  }
  else if (id.equals("3") && i==104) {
    digitalWrite(pinNumber,LOW);
    Serial.println(off);
  } 
  else if (id.equals("3") &&  i==105){
    int val = -1;
    for (int i=0;i<ind;i++) {
      if (vals[i] > val) {
        val = vals[i];
      }
    }
    float v = (val-512)*2.23296878f - 12.0f;
    String str;
    char buffer[10];
    dtostrf(v,1,2,buffer);
    str = String(buffer);
    Serial.println(id+":"+str);
  }
  //}
}

char Comp(char* This){
  while(Serial.available() > 0) // Don't read unless
    // there you know there is data
  {
    if(index < 19) // One less than the size of the array
    {
      inChar = Serial.read(); // Read a character
      inData[index] = inChar; // Store it
      index++; // Increment where to write next
      inData[index] = '\0'; // Null terminate the string
    }
  }
  Serial.println(String(inData));

  if(strcmp(inData,This) == 0){
    for(int i=0;i<19;i++){
      inData[i]=0;
    }
    index=0;
    return(0);

  }
  else{
    return(1);
  }
}


