package com.sharad.electrify;

import java.io.IOException;
import java.util.ArrayList;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.StrictMode;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.Toast;

import com.flotype.bridge.Bridge;
import com.flotype.bridge.BridgeRemoteObject;

public class ElectrifyActivity extends Activity {

	private TextToSpeech tts;
	public static int SPEECH_REQUEST_CODE = 1;

	interface Electrify extends BridgeRemoteObject {
		public void toggle(String id);

		public void on(String id);

		public void off(String id);

		public boolean state(String id);
	}

	Electrify electrify;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		if (android.os.Build.VERSION.SDK_INT > 9) {
			StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder()
					.permitAll().build();
			StrictMode.setThreadPolicy(policy);
		}
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_electrify);

		Bridge bridge = new Bridge().setApiKey("245b536642b8bbe7");

		Button button = (Button) findViewById(R.id.button);
		button.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View arg0) {
				toggle("1");
			}
		});
		Button button2 = (Button) findViewById(R.id.button2);
		button2.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View arg0) {
				toggle("2");
			}
		});
		Button button3 = (Button) findViewById(R.id.button3);
		button3.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View arg0) {
				toggle("3");
			}
		});
		Button speech = (Button) findViewById(R.id.speech);
		speech.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View arg0) {
				sendRecognizeIntent();
			}
		});
		try {
			bridge.connect();
			electrify = bridge.getService("electrify", Electrify.class);
		} catch (IOException e) {
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.activity_electrify, menu);
		return true;
	}

	private void sendRecognizeIntent() {
		Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
		intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
				RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
		intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Say the magic word");
		intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 100);
		startActivityForResult(intent, SPEECH_REQUEST_CODE);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == SPEECH_REQUEST_CODE) {
			if (resultCode == RESULT_OK) {
				ArrayList<String> matches = data
						.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);

				if (matches.size() == 0) {
					tts.speak("Heard nothing", TextToSpeech.QUEUE_FLUSH, null);
				} else {
					String mostLikelyThingHeard = matches.get(0);
					Toast.makeText(this, mostLikelyThingHeard,
							Toast.LENGTH_LONG).show();
					Log.d("tts", mostLikelyThingHeard);
					String[] chunks = mostLikelyThingHeard.split(" ");
					if (chunks.length > 3)
						if (chunks[0].equals("turn")) {
							if (chunks[1].equals("off")) {
								String id = chunks[chunks.length - 1];
								if (id.equals("to") || id.equals("too")) {
									id = "2";
								}
								off(id);
							}
							if (chunks[1].equals("on")) {
								String id = chunks[chunks.length - 1];
								if (id.equals("to") || id.equals("too")) {
									id = "2";
								}
								on(id);
							}
						} else if (chunks[0].equals("toggle")
								|| chunks[0].equals("hogle")) {
							String id = chunks[chunks.length - 1];
							if (id.equals("to") || id.equals("too")) {
								id = "2";
							}
							Log.d("tts", id + "");
							toggle(id);
						}
				}
			} else {
				Log.d("tts", "result NOT ok");
			}
		}

		super.onActivityResult(requestCode, resultCode, data);
	}

	public void toggle(final String id) {
		Runnable r = new Runnable() {
			@Override
			public void run() {
				electrify.toggle(id);
			}
		};
		(new Thread(r)).start();

	}

	public void on(final String id) {
		Runnable r = new Runnable() {
			@Override
			public void run() {
				electrify.on(id);
			}
		};
		(new Thread(r)).start();

	}

	public void off(final String id) {
		Runnable r = new Runnable() {
			@Override
			public void run() {
				electrify.off(id);
			}
		};
		(new Thread(r)).start();

	}
}
