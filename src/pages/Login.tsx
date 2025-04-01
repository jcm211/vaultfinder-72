
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Camera, User, X, Phone, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [faceCapture, setFaceCapture] = useState<string | null>(null);
  const [isFaceVerifying, setIsFaceVerifying] = useState(false);
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    login, 
    verifyFace, 
    verifyPhone,
    sendVerificationCode,
    isAuthenticated, 
    user, 
    hasPendingVerification, 
    pendingUser,
    verificationStep
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin" || user?.role === "ceo") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle face capture
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isCapturingFace) {
      const startVideo = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing webcam:", error);
          toast({
            title: "Camera Error",
            description: "Could not access your camera. Please check permissions.",
            variant: "destructive",
          });
          setIsCapturingFace(false);
        }
      };
      
      startVideo();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCapturingFace, toast]);

  // Pre-fill phone number if available from pendingUser
  useEffect(() => {
    if (pendingUser?.phoneNumber && !phoneNumber) {
      setPhoneNumber(pendingUser.phoneNumber);
    }
  }, [pendingUser, phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        if (result.requiresSecondFactor) {
          setIsCapturingFace(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the data URL from canvas
        const capturedImage = canvas.toDataURL('image/png');
        setFaceCapture(capturedImage);
        setIsCapturingFace(false);
        
        // Stop all video tracks
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
      }
    }
  };

  const handleVerifyFace = async () => {
    if (!faceCapture) {
      toast({
        title: "Missing Face Data",
        description: "Please capture your face first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsFaceVerifying(true);
    
    try {
      // In a real app, we would send the face data to a server for processing
      await verifyFace(faceCapture);
      // Verification step change is handled in the AuthContext
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred during face verification.",
        variant: "destructive",
      });
    } finally {
      setIsFaceVerifying(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSendingCode(true);
    
    try {
      const success = await sendVerificationCode(phoneNumber);
      if (success) {
        setCodeSent(true);
        // Focus on the OTP input
        document.getElementById('otp-input')?.focus();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneNumber || otpValue.length !== 6) {
      toast({
        title: "Missing Information",
        description: "Please enter a valid phone number and verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifyingCode(true);
    
    try {
      const success = await verifyPhone(phoneNumber, otpValue);
      // If successful, useEffect will handle redirection
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred during phone verification.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const resetFaceCapture = () => {
    setFaceCapture(null);
    setIsCapturingFace(false);
  };

  // Render the appropriate verification step based on the current verification step
  const renderVerificationStep = () => {
    if (verificationStep === "face") {
      return (
        <Card className="w-full max-w-md overflow-hidden animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Face Verification</CardTitle>
            <CardDescription>
              {pendingUser?.username}, please verify your identity to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isCapturingFace ? (
              <div className="relative">
                <div className="rounded-lg overflow-hidden border-2 border-primary">
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                </div>
                <Button 
                  onClick={captureFrame}
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                  size="sm"
                >
                  <Camera className="mr-1" /> Capture
                </Button>
              </div>
            ) : faceCapture ? (
              <div className="relative">
                <img 
                  src={faceCapture} 
                  alt="Captured face" 
                  className="w-full h-64 object-cover rounded-lg border-2 border-primary"
                />
                <Button
                  onClick={resetFaceCapture}
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
                onClick={() => setIsCapturingFace(true)}
              >
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Click to start camera</p>
              </div>
            )}
            
            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleVerifyFace}
              className="w-full"
              disabled={!faceCapture || isFaceVerifying}
            >
              {isFaceVerifying ? "Verifying..." : "Verify Identity"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setFaceCapture(null);
                setIsCapturingFace(false);
                window.location.href = "/login";
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      );
    } else if (verificationStep === "phone") {
      return (
        <Card className="w-full max-w-md overflow-hidden animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Phone Verification</CardTitle>
            <CardDescription>
              Enter your phone number to receive a verification code
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex space-x-2">
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 555-5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                  disabled={codeSent}
                />
                <Button 
                  onClick={handleSendCode} 
                  disabled={isSendingCode || (!phoneNumber || phoneNumber.length < 10) || codeSent}
                  variant={codeSent ? "outline" : "default"}
                  className="whitespace-nowrap"
                >
                  {codeSent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Sent
                    </>
                  ) : isSendingCode ? (
                    "Sending..."
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-1" /> Send Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="otp-input">Verification Code</Label>
              <InputOTP 
                id="otp-input"
                maxLength={6} 
                value={otpValue} 
                onChange={setOtpValue}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-center text-gray-500 mt-1">
                Enter the 6-digit code sent to your phone
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleVerifyPhone}
              className="w-full"
              disabled={!codeSent || otpValue.length < 6 || isVerifyingCode}
            >
              {isVerifyingCode ? "Verifying..." : "Complete Login"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setCodeSent(false);
                setOtpValue("");
                window.location.href = "/login";
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // Default to password step (initial login)
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-scale-in">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Secure Login</h1>
          <p className="text-gray-500 text-center mb-8">
            Access the system with your credentials
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-center text-gray-500">
            Return to <a href="/" className="text-primary hover:underline">Home Page</a>
          </p>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
      {hasPendingVerification ? renderVerificationStep() : renderVerificationStep()}
    </div>
  );
};

export default Login;
